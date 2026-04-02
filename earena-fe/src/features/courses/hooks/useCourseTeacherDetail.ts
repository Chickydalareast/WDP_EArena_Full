'use client';

import { useQuery } from '@tanstack/react-query';
import { courseService } from '../api/course.service';
import { courseQueryKeys } from '../api/course-keys';

export const useCourseTeacherDetail = (courseId: string) => {
    return useQuery({
        queryKey: courseQueryKeys.teacherDetail(courseId),
        queryFn: () => courseService.getCourseTeacherDetail(courseId),
        enabled: !!courseId,
        staleTime: 5 * 60 * 1000,
    });
};