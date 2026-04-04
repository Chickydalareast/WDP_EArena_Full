'use client';

import { useQuery } from '@tanstack/react-query';
import { courseService } from '../api/course.service';
import { courseQueryKeys } from '../api/course-keys';

export const useQuizStats = (courseId: string, lessonId: string) => {
    return useQuery({
        queryKey: courseQueryKeys.quizStats(courseId, lessonId),
        queryFn: async () => {
            const response = await courseService.getQuizStats(courseId, lessonId);
            return response?.data ?? null;
        },
        enabled: !!courseId && !!lessonId,
        staleTime: 1000 * 60 * 5,
    });
};
export const useQuizAttempts = (courseId: string, lessonId: string, page: number, limit: number) => {
    return useQuery({
        queryKey: courseQueryKeys.quizAttempts(courseId, lessonId, { page, limit }),
        queryFn: async () => {
            const response = await courseService.getQuizAttempts(courseId, lessonId, page, limit);
            return {
                items: response.data,
                meta: response.meta
            };
        },
        enabled: !!courseId && !!lessonId,
        placeholderData: (previousData) => previousData,
        staleTime: 1000 * 60 * 2,
    });
};