'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { axiosClient } from '@/shared/lib/axios-client';
import { API_ENDPOINTS } from '@/config/api-endpoints';
import { examBuilderService } from '../api/exam-builder.service';
import { OmitFolderIdDTO } from '../components/ManualQuestionForm';
import { examQueryKeys } from '../api/query-keys';
import { ApiError } from '@/shared/lib/error-parser';

// [CTO FIX]: Khử toàn bộ 'any', ép kiểu an toàn khi đệ quy tìm ID Folder
const findFolderByName = (data: unknown, targetName: string): string | null => {
  if (!data) return null;
  const parsed = data as Record<string, unknown>;
  const folders = Array.isArray(parsed) ? parsed : (Array.isArray(parsed.items) ? parsed.items : (Array.isArray(parsed.data) ? parsed.data : []));
  
  if (folders.length === 0) return null;

  for (const folder of folders) {
    if (typeof folder === 'object' && folder !== null) {
        const f = folder as Record<string, unknown>;
        if (f.name === targetName) return String(f._id || f.id);
        if (Array.isArray(f.children) && f.children.length > 0) {
          const foundId = findFolderByName(f.children, targetName);
          if (foundId) return foundId;
        }
    }
  }
  return null;
};

// Định nghĩa Data Contract an toàn
interface FolderCreateResponse {
  id?: string;
  _id?: string;
}

interface QuestionCreateResponse {
  id?: string;
  _id?: string;
  insertedIds?: string[];
}

export const useAddManualQuestion = (paperId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (questionData: OmitFolderIdDTO) => {
      if (!paperId || paperId === 'undefined' || paperId === 'null') {
        throw new Error('Mã đề thi (paperId) không hợp lệ. Vui lòng quay lại danh sách và vào lại.');
      }

      const folderName = `[Tự tạo ngầm] Tài nguyên của mã đề: ${paperId}`;
      let targetFolderId = '';

      // [BƯỚC 1]: SMART FOLDER RESOLUTION
      const foldersResponse = await axiosClient.get(API_ENDPOINTS.FOLDERS.MY_FOLDERS);
      const existingId = findFolderByName(foldersResponse, folderName);
      
      if (existingId) {
        targetFolderId = existingId; 
      } else {
        const newFolder = await axiosClient.post(API_ENDPOINTS.FOLDERS.BASE, {
          name: folderName,
          parentId: null 
        }) as FolderCreateResponse;
        targetFolderId = String(newFolder.id || newFolder._id || '');
      }

      if (!targetFolderId) throw new Error('Không thể xác định thư mục lưu trữ');

      // [BƯỚC 2]: TRANSFORMATION & GỌI API TẠO CÂU HỎI
      const LABELS = ['A', 'B', 'C', 'D'];
      const formattedAnswers = questionData.answers.map((ans, index) => ({
        id: LABELS[index],
        content: ans.content,
        isCorrect: LABELS[index] === questionData.correctAnswerId,
      }));

      const questionResponse = await axiosClient.post(API_ENDPOINTS.QUESTIONS.BASE, {
         content: questionData.content,
         answers: formattedAnswers,
         folderId: targetFolderId, 
         isDraft: true, 
      }) as QuestionCreateResponse;

      // [CTO FIX]: Fallback ID Parsing - Hứng trọn mọi case BE có thể trả về
      let newQuestionId = '';
      if (questionResponse.insertedIds && Array.isArray(questionResponse.insertedIds) && questionResponse.insertedIds.length > 0) {
        newQuestionId = String(questionResponse.insertedIds[0]);
      } else {
        newQuestionId = String(questionResponse.id || questionResponse._id || '');
      }

      if (!newQuestionId) throw new Error('BE không trả về ID câu hỏi');

      // [BƯỚC 3]: BỐC VÀO VỎ ĐỀ (BƯỚC NÀY KHÔNG CÒN BỊ CHẾT NỮA)
      await examBuilderService.updatePaperQuestions(paperId, {
        action: 'ADD',
        questionId: newQuestionId,
      });

      return newQuestionId;
    },
    onSuccess: () => {
      toast.success('Đã lưu câu hỏi vào đề!');
      queryClient.invalidateQueries({ queryKey: examQueryKeys.paperDetail(paperId) });
    },
    onError: (err: ApiError | Error) => {
      const desc = 'message' in err && typeof err.message === 'string' 
        ? err.message 
        : 'Lỗi hệ thống không xác định';
      toast.error('Lỗi thao tác', { description: desc });
    }
  });
};