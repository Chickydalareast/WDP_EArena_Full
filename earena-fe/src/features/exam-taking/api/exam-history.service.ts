import { axiosClient } from '@/shared/lib/axios-client';
import { API_ENDPOINTS } from '@/config/api-endpoints';
import { ExamHistoryOverview, ExamAttemptDetail } from '../types/exam-history.schema';

export const examHistoryKeys = {
    all: ['exam-history'] as const,
    overview: () => [...examHistoryKeys.all, 'overview'] as const,
    lesson: (lessonId: string) => [...examHistoryKeys.all, 'lesson', lessonId] as const,
};

export const examHistoryService = {
    getOverview: async (): Promise<ExamHistoryOverview[]> => {
        const response = await axiosClient.get(API_ENDPOINTS.EXAM_TAKING.HISTORY_OVERVIEW);
        return response?.data?.data || response?.data || [];
    },

    getLessonAttempts: async (lessonId: string): Promise<ExamAttemptDetail[]> => {
        const response = await axiosClient.get(API_ENDPOINTS.EXAM_TAKING.HISTORY_LESSON(lessonId));
        return response?.data?.data || response?.data || [];
    }
};