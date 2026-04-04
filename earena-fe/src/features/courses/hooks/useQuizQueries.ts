import { useQuery } from '@tanstack/react-query';
import { courseService } from '../api/course.service';
import { courseQueryKeys } from '../api/course-keys';

export const useLessonQuizDetail = (courseId: string, lessonId: string) => {
    return useQuery({
        queryKey: courseQueryKeys.lessonQuizDetail(courseId, lessonId),
        queryFn: () => courseService.getTeacherLessonQuizDetail(courseId, lessonId),
        enabled: !!courseId && !!lessonId,
        staleTime: 0,
    });
};

export const useQuizHealth = (courseId: string, lessonId: string) => {
    return useQuery({
        queryKey: ['quiz-health', courseId, lessonId],
        queryFn: async () => {
            const response = await courseService.getQuizHealth(courseId, lessonId);
            return (response as any).data || response;
        },
        enabled: !!courseId && !!lessonId,
        staleTime: 0,
    });
};

export const useQuizMatricesList = (params: { courseId: string; page: number; limit: number; search?: string }) => {
    return useQuery({
        queryKey: courseQueryKeys.quizMatricesList(params.courseId, params),
        queryFn: () => courseService.getQuizMatrices(params),
        enabled: !!params.courseId,
        placeholderData: (prev) => prev,
        staleTime: 0,
    });
};

export const useExamMatrixDetail = (id: string, enabled: boolean) => {
    return useQuery({
        queryKey: ['exam-matrix-detail', id],
        queryFn: () => courseService.getExamMatrixDetail(id),
        enabled: enabled && !!id,
        staleTime: 0,
    });
};