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

export const useQuizHealth = (lessonId: string) => {
    return useQuery({
        queryKey: ['quiz-health', lessonId],
        queryFn: async () => {
            const response = await courseService.getQuizHealth(lessonId);
            return (response as any).data || response;
        },
        enabled: !!lessonId,
        staleTime: 0,
    });
};