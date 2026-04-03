'use client';

import { useQuery } from '@tanstack/react-query';
import { courseService } from '../api/course.service';
import { courseQueryKeys } from '../api/course-keys';


export const useLessonQuizDetail = (courseId: string, lessonId: string | null) => {
    return useQuery({
        queryKey: courseQueryKeys.lessonQuizDetail(courseId, lessonId ?? ''),
        queryFn: () => courseService.getTeacherLessonQuizDetail(courseId, lessonId!),
        enabled: !!courseId && !!lessonId,
        staleTime: 2 * 60 * 1000,
        retry: false,
    });
};