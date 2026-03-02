// src/features/exam-builder/hooks/useInitExam.ts
'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { examBuilderService, InitExamDTO, InitExamResponse } from '../api/exam-builder.service';
import { useExamBuilderStore } from '../stores/exam-builder.store';
import { ApiError } from '@/shared/lib/error-parser';

export const useInitExam = () => {
  const router = useRouter();
  const setBuilderSession = useExamBuilderStore((state) => state.setBuilderSession);

  return useMutation<InitExamResponse, ApiError, InitExamDTO>({
    mutationFn: examBuilderService.initExam,
    onSuccess: (data) => {
      // 1. Lưu ID vào Transient Store (RAM), tuyệt đối không dùng localStorage
      setBuilderSession({
        examId: data.examId,
        paperId: data.paperId,
      });

      toast.success('Khởi tạo vỏ đề thi thành công', {
        description: 'Đang chuyển hướng đến không gian soạn thảo...',
      });

      // 2. Chuyển hướng sang Step 2 (Giao diện Builder)
      // Dùng examId trên URL để routing, paperId đã nằm an toàn trong Zustand
      router.push(`/teacher/exams/${data.examId}/builder`);
    },
    onError: (error) => {
      toast.error('Không thể khởi tạo đề thi', {
        description: error.message || 'Lỗi hệ thống. Vui lòng thử lại.',
      });
    },
  });
};