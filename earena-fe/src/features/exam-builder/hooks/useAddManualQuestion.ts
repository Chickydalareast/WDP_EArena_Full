'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { axiosClient } from '@/shared/lib/axios-client';
import { API_ENDPOINTS } from '@/config/api-endpoints';
import { examBuilderService } from '../api/exam-builder.service';
import { OmitFolderIdDTO } from '../components/ManualQuestionForm';
import { examQueryKeys } from '../api/query-keys';
import { ApiError } from '@/shared/lib/error-parser';
import { FolderNode, FolderResponse } from './useFolders';

const findFolderByName = (data: unknown, targetName: string): string | null => {
  if (!data) return null;
  
  let folders: FolderNode[] = [];
  if (Array.isArray(data)) {
    folders = data;
  } else if (data && typeof data === 'object') {
    const resObj = data as FolderResponse;
    if (Array.isArray(resObj.items)) folders = resObj.items;
    else if (Array.isArray(resObj.data)) folders = resObj.data;
  }
  
  if (folders.length === 0) return null;

  for (const folder of folders) {
    if (folder.name === targetName) return folder._id ?? null;
    if (Array.isArray(folder.children) && folder.children.length > 0) {
      const foundId = findFolderByName(folder.children, targetName);
      if (foundId) return foundId;
    }
  }
  return null;
};

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

      const foldersResponse = await axiosClient.get(API_ENDPOINTS.QUESTION_FOLDERS.BASE);
      const existingId = findFolderByName(foldersResponse, folderName);
      
      if (existingId) {
        targetFolderId = existingId; 
      } else {
        const newFolder = await axiosClient.post(API_ENDPOINTS.QUESTION_FOLDERS.BASE, {
          name: folderName,
          parentId: null 
        }) as FolderCreateResponse;
        targetFolderId = String(newFolder.id || newFolder._id || '');
      }

      if (!targetFolderId) throw new Error('Không thể xác định thư mục lưu trữ');

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

      let newQuestionId = '';
      if (questionResponse.insertedIds && Array.isArray(questionResponse.insertedIds) && questionResponse.insertedIds.length > 0) {
        newQuestionId = String(questionResponse.insertedIds[0]);
      } else {
        newQuestionId = String(questionResponse.id || questionResponse._id || '');
      }

      if (!newQuestionId) throw new Error('BE không trả về ID câu hỏi');

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