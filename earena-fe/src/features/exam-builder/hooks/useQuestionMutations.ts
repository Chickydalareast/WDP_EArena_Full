'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { examBuilderService } from '../api/exam-builder.service';
import { examQueryKeys } from '../api/query-keys';
import { QuestionItemDTO, UpdateSingleQuestionDTO, UpdatePassageDTO } from '../types/exam.schema';
import { ApiError } from '@/shared/lib/error-parser';

export const useAddBulkManual = (paperId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ questionsData, folderId }: { questionsData: QuestionItemDTO[], folderId: string }) => {
      if (!folderId) throw new Error('Không tìm thấy ID Thư mục lưu trữ của mã đề này!');

      const bulkResponse = await examBuilderService.bulkCreateQuestionsAndReturnIds({
        folderId: folderId,
        questions: questionsData
      });

      let createdRootIds: string[] = [];

      // [CTO FIX]: Thuật toán Resilience Parsing - Bắt mọi loại Data Contract BE trả về
      const extractRootIds = (arr: unknown[]): string[] => {
        return arr.map(item => {
          // Trường hợp 1: BE trả thẳng mảng các ID dạng chuỗi (String Array)
          if (typeof item === 'string') return item;
          
          // Trường hợp 2: BE trả mảng các Object câu hỏi chi tiết
          if (typeof item === 'object' && item !== null) {
            const q = item as Record<string, unknown>;
            if (q.parentPassageId) return ''; // Bỏ qua câu hỏi con
            return String(q._id || q.id || '');
          }
          return '';
        }).filter(id => id !== '');
      };

      // Đọc vỏ (Wrapper) của Response
      if (Array.isArray(bulkResponse)) {
        createdRootIds = extractRootIds(bulkResponse);
      } else if (typeof bulkResponse === 'object' && bulkResponse !== null) {
        const resObj = bulkResponse as Record<string, unknown>;
        if (Array.isArray(resObj.insertedIds)) createdRootIds = extractRootIds(resObj.insertedIds);
        else if (Array.isArray(resObj.data)) createdRootIds = extractRootIds(resObj.data);
        else if (Array.isArray(resObj.items)) createdRootIds = extractRootIds(resObj.items);
      }

      if (createdRootIds.length === 0) {
        throw new Error('Hệ thống tạo thành công nhưng không trả về ID. Vui lòng tải lại trang.');
      }

      // [BƯỚC 2]: Chèn câu hỏi vào Đề
      const results = await Promise.allSettled(
        createdRootIds.map((id: string) =>
          examBuilderService.updatePaperQuestions(paperId, { action: 'ADD', questionId: id })
        )
      );

      const successCount = results.filter(r => r.status === 'fulfilled').length;

      if (successCount === 0) {
        throw new Error('Không thể chèn bất kỳ câu hỏi nào vào đề thi. Vui lòng thử lại.');
      }

      return successCount;
    },
    onSuccess: () => {
      toast.success('Đã lưu câu hỏi vào đề!');
      queryClient.invalidateQueries({ queryKey: examQueryKeys.paperDetail(paperId) });
    },
    onError: (err: Error | ApiError) => {
      const errorMessage = 'message' in err && typeof err.message === 'string' 
        ? err.message 
        : 'Có lỗi xảy ra khi lưu vào vỏ đề';
      toast.error('Lỗi khi lưu câu hỏi', { description: errorMessage });
    }
  });
};

export const useDeleteQuestion = (paperId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (questionId: string) => examBuilderService.deleteQuestion(questionId),
    onSuccess: () => {
      toast.success('Đã xóa vĩnh viễn câu hỏi khỏi hệ thống!');
      queryClient.invalidateQueries({ queryKey: examQueryKeys.paperDetail(paperId) });
    },
    onError: (err: ApiError) => toast.error('Lỗi xóa câu hỏi', { description: err.message })
  });
};

export interface MutationContext {
  paperId?: string;
  isBankMode?: boolean;
}

export const useUpdateSingleQuestion = (context?: MutationContext) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ questionId, payload }: { questionId: string, payload: UpdateSingleQuestionDTO }) => 
      examBuilderService.updateSingleQuestion(questionId, payload),
    onSuccess: () => {
      setTimeout(() => {
        if (context?.paperId) queryClient.invalidateQueries({ queryKey: examQueryKeys.paperDetail(context.paperId) });
        if (context?.isBankMode) queryClient.invalidateQueries({ queryKey: ['question-bank', 'questions'] });
      }, 500);
      toast.success('Đã lưu câu hỏi!');
    },
    onError: (err: ApiError) => toast.error('Lỗi lưu câu hỏi', { description: err.message })
  });
};

export const useUpdatePassageQuestion = (context?: MutationContext) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ passageId, payload }: { passageId: string, payload: UpdatePassageDTO }) => 
      examBuilderService.updatePassageQuestion(passageId, payload),
    onSuccess: () => {
      setTimeout(() => {
        if (context?.paperId) queryClient.invalidateQueries({ queryKey: examQueryKeys.paperDetail(context.paperId) });
        if (context?.isBankMode) queryClient.invalidateQueries({ queryKey: ['question-bank', 'questions'] });
      }, 500);
      toast.success('Đã lưu toàn bộ Bài đọc!');
    },
    onError: (err: ApiError) => toast.error('Lỗi', { description: err.message })
  });
};