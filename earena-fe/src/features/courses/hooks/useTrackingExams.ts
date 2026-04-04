import { useQuery } from '@tanstack/react-query';
import { courseService } from '../api/course.service';
import { courseQueryKeys } from '../api/course-keys';

export function useTrackingMemberExams(courseId: string, studentId: string | null) {
    return useQuery({
        queryKey: courseQueryKeys.trackingMemberExams(courseId, studentId || ''),
        queryFn: () => courseService.getTrackingMemberExams(courseId, studentId!, {}),
        enabled: !!studentId,
        staleTime: 5 * 60 * 1000,
    });
}

export function useTrackingMemberAttempts(courseId: string, studentId: string | null, lessonId: string | null) {
    return useQuery({
        queryKey: courseQueryKeys.trackingMemberAttempts(courseId, studentId || '', lessonId || ''),
        queryFn: () => courseService.getTrackingMemberAttempts(courseId, studentId!, lessonId!, {}),
        enabled: !!studentId && !!lessonId,
        staleTime: 5 * 60 * 1000,
    });
}