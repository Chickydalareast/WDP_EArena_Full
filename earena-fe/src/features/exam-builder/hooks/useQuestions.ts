'use client';

import { useQuery } from '@tanstack/react-query';
import { axiosClient } from '@/shared/lib/axios-client';
import { API_ENDPOINTS } from '@/config/api-endpoints';

interface FetchQuestionsParams {
  page?: number;
  limit?: number;
  topicId?: string;
  difficultyLevel?: string;
}

export const useQuestions = (params?: FetchQuestionsParams) => {
  return useQuery({
    queryKey: ['questions', 'bank', params],
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        page: String(params?.page || 1),
        limit: String(params?.limit || 20),
        isDraft: 'false', 
        ...(params?.topicId && { topicId: params.topicId }),
        ...(params?.difficultyLevel && { difficultyLevel: params.difficultyLevel }),
      });

      return axiosClient.get(`${API_ENDPOINTS.QUESTIONS.BASE}?${queryParams.toString()}`);
    },
    staleTime: 5 * 60 * 1000, 
  });
};