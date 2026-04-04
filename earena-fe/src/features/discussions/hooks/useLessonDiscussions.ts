'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { discussionService } from '../api/discussion.service';
import { discussionQueryKeys } from '../api/discussion-keys';
import { SortOption } from '../types/discussion.schema';

interface UseLessonDiscussionsProps {
    courseId: string;
    lessonId: string;
    sortBy?: SortOption;
    limit?: number;
}

export const useLessonDiscussions = ({
    courseId,
    lessonId,
    sortBy = 'recent',
    limit = 10,
}: UseLessonDiscussionsProps) => {
    return useInfiniteQuery({
        queryKey: discussionQueryKeys.questions(courseId, lessonId, sortBy),
        queryFn: async ({ pageParam = 1 }) => {
            return discussionService.getQuestions(lessonId, {
                courseId,
                page: pageParam as number,
                limit,
                sortBy,
            });
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            const { page, limit, total } = lastPage.meta;
            const totalPages = Math.ceil(total / limit);
            return page < totalPages ? page + 1 : undefined;
        },
        enabled: !!lessonId && !!courseId,
        staleTime: 1000 * 60 * 2,
    });
};