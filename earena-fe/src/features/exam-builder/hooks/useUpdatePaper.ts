// src/features/exam-builder/hooks/useUpdatePaper.ts
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { examBuilderService, UpdatePaperDTO } from '../api/exam-builder.service';
import { ApiError } from '@/shared/lib/error-parser';

export const useUpdatePaper = (paperId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, UpdatePaperDTO>({
    // Cắt luồng nếu mất Session (paperId null) để tránh văng lỗi 404 từ BE
    mutationFn: async (data: UpdatePaperDTO) => {
      if (!paperId) throw new Error('Mất phiên làm việc. Vui lòng tải lại trang.');
      return examBuilderService.updatePaperQuestions(paperId, data);
    },
    onSuccess: (_, variables) => {
      // Ép TanStack Query fetch lại danh sách câu hỏi của mã đề này
      // (Danh sách này sẽ được query ở màn Builder)
      queryClient.invalidateQueries({ 
        queryKey: ['papers', paperId, 'questions'] 
      });

      const actionText = variables.action === 'ADD' ? 'Thêm' : 'Xóa';
      toast.success(`Đã ${actionText} câu hỏi thành công.`);
    },
    onError: (error) => {
      // BẪY EDGE CASES TỬ HUYỆT (Dựa trên StatusCode của NestJS trả về)
      switch (error.statusCode) {
        case 409: // Conflict
          toast.error('Thao tác thất bại', {
            description: 'Câu hỏi này đã tồn tại trong đề thi.',
          });
          break;
        case 400: // Bad Request
          toast.error('Đề thi đã bị khóa', {
            description: 'Đề thi này đã được Publish hoặc Giao cho lớp, không thể thêm bớt câu hỏi.',
          });
          break;
        default:
          toast.error('Lỗi cập nhật mã đề', {
            description: error.message || 'Đường truyền không ổn định.',
          });
      }
    },
  });
};