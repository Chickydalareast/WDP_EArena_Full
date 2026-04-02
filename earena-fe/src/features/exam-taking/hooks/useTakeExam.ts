'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { axiosClient } from '@/shared/lib/axios-client';
import { API_ENDPOINTS } from '@/config/api-endpoints';
import { toast } from 'sonner';

export interface ExamResultResponse {
  status: 'GRADING_IN_PROGRESS' | 'COMPLETED';
  message?: string;
  retryAfter?: number;
  summary?: {
    score: number;
    totalQuestions: number;
    correctCount: number;
    incorrectCount: number;
    submittedAt: string;
    attemptNumber: number;
  };
  details?: unknown[];
}

interface StartExamPayload {
  courseId: string;
  lessonId: string;
}

export const useStartExam = () => {
  return useMutation({
    mutationFn: async (payload: StartExamPayload) => {
      if (!payload.courseId || !payload.lessonId) {
        throw new Error('Thiếu định danh bài học hoặc khóa học');
      }

      const response = await axiosClient.post(API_ENDPOINTS.EXAM_TAKING.START, payload);
      return response?.data?.data || response?.data || response;
    },
    onError: (error: any) => {
      toast.error('Lỗi không gian thi', { 
        description: error?.response?.data?.message || error.message || 'Không thể bắt đầu' 
      });
    }
  });
};


export const useAutoSave = (submissionId: string | null) => {
  return useMutation({
    mutationFn: async (payload: { questionId: string; selectedAnswerId: string | null }) => {
      if (!submissionId) throw new Error('Mất phiên Session');
      return axiosClient.patch(API_ENDPOINTS.EXAM_TAKING.AUTO_SAVE(submissionId), payload);
    },
    retry: 3, 
    retryDelay: 1500,
    onError: () => toast.error('Mất kết nối mạng! Hệ thống đang cố gắng lưu lại...'),
  });
};

export const useSubmitExam = (submissionId: string | null) => {
  return useMutation({
    mutationFn: async () => {
      if (!submissionId) throw new Error('Mất phiên Session');
      return axiosClient.post(API_ENDPOINTS.EXAM_TAKING.SUBMIT(submissionId));
    }
  });
};

export const useExamResultPolling = (submissionId: string | null, isEnabled: boolean) => {
  return useQuery({
    queryKey: ['exam-result', submissionId],
    queryFn: async () => {
      const response = await axiosClient.get(API_ENDPOINTS.EXAM_TAKING.RESULT(submissionId!));
      const result = response?.data?.data || response?.data || response;
      return result ?? null; 
    },
    enabled: !!submissionId && isEnabled,
    refetchInterval: (query) => {
      const currentData = query.state.data as any;
      if (currentData?.status === 'GRADING_IN_PROGRESS') return 2500;
      return false; 
    },
  });
};

export const useExamReview = (submissionId: string) => {
  return useQuery<ExamResultResponse, Error>({
    queryKey: ['exam-review', submissionId],
    queryFn: async () => {
      const response = await axiosClient.get(API_ENDPOINTS.EXAM_TAKING.RESULT(submissionId));
      return response?.data?.data || response?.data || response;
    },
    enabled: !!submissionId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.status === 'GRADING_IN_PROGRESS') {
        return data.retryAfter || 2000;
      }
      return false; 
    },
    refetchOnWindowFocus: false, 
  });
};