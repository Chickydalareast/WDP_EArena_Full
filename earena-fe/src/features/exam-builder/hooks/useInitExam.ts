'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { examBuilderService } from '../api/exam-builder.service';
import { InitExamDTO, InitExamResponse } from '../types/exam.schema';
import { ApiError } from '@/shared/lib/error-parser';

export const useInitExam = () => {
  const router = useRouter();

  return useMutation<InitExamResponse, ApiError, InitExamDTO>({
    mutationFn: examBuilderService.initExam,
    onSuccess: (data) => {
      toast.success('Khởi tạo vỏ đề thi thành công', {
        description: 'Đang chuyển hướng đến không gian soạn thảo...',
      });
      router.push(`/teacher/exams/${data.examId}/builder?paperId=${data.paperId}`);
    },
    onError: (error) => {
      toast.error('Không thể khởi tạo đề thi', {
        description: error.message || 'Lỗi hệ thống. Vui lòng thử lại.',
      });
    },
  });
};