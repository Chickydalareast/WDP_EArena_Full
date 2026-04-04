import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { courseService } from '../api/course.service';
import { courseQueryKeys } from '../api/course-keys';
import { GetTrackingMembersParams } from '../types/course.schema';

export function useTrackingMembers(courseId: string, params: GetTrackingMembersParams) {
    return useQuery({
        queryKey: courseQueryKeys.trackingMembers(courseId, params),
        queryFn: () => courseService.getTrackingMembers(courseId, params),
        placeholderData: keepPreviousData,
        staleTime: 5 * 60 * 1000,
    });
}