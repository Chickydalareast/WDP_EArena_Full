'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { axiosClient } from '@/shared/lib/axios-client';
import { API_ENDPOINTS } from '@/config/api-endpoints';
import { toast } from 'sonner';
import { StartExamPayload, StartExamResponse, ExamPaperResponse } from '../types/exam-take.schema';

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

export const useStartExam = () => {
  return useMutation({
    mutationFn: async (payload: StartExamPayload) => {
      if (!payload.courseId || !payload.lessonId) {
        throw new Error('Thiếu định danh bài học hoặc khóa học');
      }

      return axiosClient.post<unknown, StartExamResponse>(API_ENDPOINTS.EXAM_TAKING.START, payload);
    },
  });
};

export const useGetExamPaper = (submissionId: string | null) => {
  return useQuery({
    queryKey: ['exam-paper', submissionId],
    queryFn: async () => {
      if (!submissionId) throw new Error('Không tìm thấy phiên làm bài');
      return axiosClient.get<unknown, ExamPaperResponse>(API_ENDPOINTS.EXAM_TAKING.PAPER(submissionId));
    },
    enabled: !!submissionId,
    refetchOnWindowFocus: false,
    staleTime: 0,
  });
};

export const useAutoSave = (submissionId: string | null) => {
  return useMutation({
    mutationFn: async (payload: { questionId: string; selectedAnswerId: string | null }) => {
      if (!submissionId) throw new Error('Mất phiên Session thi');
      return axiosClient.patch(API_ENDPOINTS.EXAM_TAKING.AUTO_SAVE(submissionId), payload);
    },
    retry: 3,
    retryDelay: 1500,
    onError: () => toast.error('Mạng chậm! Hệ thống đang cố gắng lưu ngầm đáp án...'),
  });
};

export const useSubmitExam = (submissionId: string | null) => {
  return useMutation({
    mutationFn: async () => {
      if (!submissionId) throw new Error('Mất phiên Session thi');
      return axiosClient.post(API_ENDPOINTS.EXAM_TAKING.SUBMIT(submissionId));
    }
  });
};

export const useExamResultPolling = (submissionId: string | null, isEnabled: boolean) => {
  return useQuery({
    queryKey: ['exam-result', submissionId],
    queryFn: async () => {
      const response = await axiosClient.get(API_ENDPOINTS.EXAM_TAKING.RESULT(submissionId!));
      const result = response as unknown as ExamResultResponse;
      return result ?? null;
    },
    enabled: !!submissionId && isEnabled,
    refetchInterval: (query) => {
      const currentData = query.state.data;
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
      return response as unknown as ExamResultResponse;
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