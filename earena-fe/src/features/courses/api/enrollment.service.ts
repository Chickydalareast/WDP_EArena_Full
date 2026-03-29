import { axiosClient } from '@/shared/lib/axios-client';
import { API_ENDPOINTS } from '@/config/api-endpoints';
import { MyLearningResponse } from '../types/enrollment.schema';

export const enrollmentService = {
  getMyLearning: async (page: number = 1, limit: number = 10): Promise<MyLearningResponse> => {
    return axiosClient.get(API_ENDPOINTS.COURSES.MY_LEARNING, {
      params: { page, limit }
    });
  }
};