'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface AssignExamPayload {
  examId: string;
  courseIds?: string[]; // Đổi type sang mảng course cho tương lai
  startTime: string;
  endTime: string;   
  timeLimit: number;
}

export const useAssignExam = () => {
  return useMutation({
    mutationFn: async (payload: AssignExamPayload) => {
      // Hàm giả lập (Stub), không call api cũ nữa
      return new Promise((resolve) => setTimeout(resolve, 300));
    },
    onSuccess: () => {
      toast.info('Tính năng giao đề đang được nâng cấp sang hệ thống Khóa Học.');
    },
    onError: () => {
      toast.error('Hệ thống đang bảo trì, vui lòng thử lại sau.');
    }
  });
};