'use client';

import { useQuery } from '@tanstack/react-query';
import { axiosClient } from '@/shared/lib/axios-client';
import { API_ENDPOINTS } from '@/config/api-endpoints';
import { examQueryKeys } from '../api/query-keys';

export const useTeacherExams = (params?: { page?: number; limit?: number; subjectId?: string }) => {
  return useQuery({
    queryKey: examQueryKeys.list(params || {}),
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', String(params.page));
      if (params?.limit) queryParams.append('limit', String(params.limit));
      if (params?.subjectId) queryParams.append('subjectId', params.subjectId);

      return axiosClient.get(`${API_ENDPOINTS.EXAMS.BASE}?${queryParams.toString()}`);
    },
    staleTime: 5 * 60 * 1000,   });
};