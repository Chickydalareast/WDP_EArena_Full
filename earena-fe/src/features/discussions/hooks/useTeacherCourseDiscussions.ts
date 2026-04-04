'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { discussionService } from '../api/discussion.service';
import { discussionQueryKeys } from '../api/discussion-keys';
import { SortOption, DiscussionFilter } from '../types/discussion.schema';

interface UseTeacherCourseDiscussionsProps {
    courseId: string;
    filter?: DiscussionFilter;
    sortBy?: SortOption;
    limit?: number;
}

export const useTeacherCourseDiscussions = ({
    courseId,
    filter = 'unanswered',
    sortBy = 'recent',
    limit = 10,
}: UseTeacherCourseDiscussionsProps) => {
    return useInfiniteQuery({
        queryKey: discussionQueryKeys.courseQuestions(courseId, filter, sortBy),
        queryFn: async ({ pageParam = 1 }) => {
            return discussionService.getCourseQuestions(courseId, {
                page: pageParam as number,
                limit,
                sortBy,
                filter,
            });
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            const { page, limit, total } = lastPage.meta;
            const totalPages = Math.ceil(total / limit);
            return page < totalPages ? page + 1 : undefined;
        },
        enabled: !!courseId,
        staleTime: 1000 * 60 * 1,
    });
};