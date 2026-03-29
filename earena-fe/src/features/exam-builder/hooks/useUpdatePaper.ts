'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { examBuilderService } from '../api/exam-builder.service';
import { UpdatePaperDTO } from '../types/exam.schema';
import { examQueryKeys } from '../api/query-keys';
import { ApiError } from '@/shared/lib/error-parser';

// Mở rộng Type để FE kẹp thêm data giả lập UI (chỉ dùng ở Client)
export type OptimisticUpdatePaperDTO = UpdatePaperDTO & {
  questionData?: any; 
};

interface MutationContext {
  previousData: any;
}

export const useUpdatePaper = (paperId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, OptimisticUpdatePaperDTO, MutationContext>({
    mutationFn: async (payload) => {
      if (!paperId) throw new Error('Mất phiên làm việc. Vui lòng tải lại trang.');
      
      // [BẢO MẬT PAYLOAD]: Tách lớp vỏ questionData (chỉ dùng cho UI) ra khỏi Payload thực tế gửi xuống BE
      const { questionData, ...apiPayload } = payload;
      
      return examBuilderService.updatePaperQuestions(paperId, apiPayload as UpdatePaperDTO);
    },

    onMutate: async (variables) => {
      if (!paperId) return { previousData: undefined };

      const queryKey = examQueryKeys.paperDetail(paperId);
      await queryClient.cancelQueries({ queryKey });

      const previousData = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (oldData: any) => {
        if (!oldData) return oldData; 

        let newQuestions = [...(oldData.questions || [])];

        // --- XỬ LÝ OPTIMISTIC CHO TỪNG NHÁNH ---
        if (variables.action === 'ADD') {
          if (!variables.questionData) {
            console.warn('[Architect Warning]: Thiếu questionData để render Optimistic UI.');
          } else {
            const exists = newQuestions.some(q => q.originalQuestionId === variables.questionId);
            if (!exists) {
              newQuestions.push(variables.questionData);
            }
          }
        } 
        else if (variables.action === 'REMOVE') {
          newQuestions = newQuestions.filter(q => q.originalQuestionId !== variables.questionId);
        }
        else if (variables.action === 'REORDER') {
          // Logic Sort mảng siêu tốc dựa theo Index của mảng questionIds đẩy lên
          newQuestions.sort((a, b) => {
            const indexA = variables.questionIds.indexOf(a.originalQuestionId);
            const indexB = variables.questionIds.indexOf(b.originalQuestionId);
            
            // Fallback an toàn nếu có ID lạ lọt vào (đẩy xuống cuối)
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            
            return indexA - indexB;
          });
        }

        return {
          ...oldData,
          questions: newQuestions,
        };
      });

      return { previousData };
    },

    onError: (error, variables, context) => {
      // Rollback nếu BE báo lỗi
      if (paperId && context?.previousData) {
        queryClient.setQueryData(examQueryKeys.paperDetail(paperId), context.previousData);
      }

      switch (error.statusCode) {
        case 409:
          toast.error('Thao tác thất bại', { description: 'Câu hỏi này đã tồn tại trong đề thi.' });
          break;
        case 400:
          toast.error('Không thể thao tác', { description: 'Đề thi đã bị khóa hoặc dữ liệu không hợp lệ.' });
          break;
        default:
          toast.error('Mất kết nối', { description: 'Đã hoàn tác thao tác vừa rồi. Vui lòng thử lại.' });
      }
    },

    onSettled: () => {
      if (paperId) {
        queryClient.invalidateQueries({ queryKey: examQueryKeys.paperDetail(paperId) });
      }
    },
  });
};