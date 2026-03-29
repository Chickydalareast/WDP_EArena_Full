'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { examBuilderService } from '../api/exam-builder.service';
import { examQueryKeys } from '../api/query-keys';
import { ApiError } from '@/shared/lib/error-parser';
import { PublishExamResponse } from '../types/exam.schema';

export const usePublishExam = (paperId: string) => {
  const queryClient = useQueryClient();

  return useMutation<PublishExamResponse, ApiError, string>({
    mutationFn: async (examId: string) => {
      return examBuilderService.publishExam(examId);
    },
    onSuccess: (data) => {
      toast.success('Chốt đề thi thành công!', {
        description: data.message || 'Đề thi đã được khóa và sẵn sàng đưa vào bài học.',
      });
      queryClient.invalidateQueries({ queryKey: examQueryKeys.paperDetail(paperId) });
    },
    onError: (error) => {
      toast.error('Lỗi chốt đề', { 
        description: error.message || 'Đề thi đã bị khóa hoặc hệ thống đang bận.' 
      });
    },
  });
};