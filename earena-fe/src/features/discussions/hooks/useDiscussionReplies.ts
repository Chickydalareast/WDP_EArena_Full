'use client';

import { useQuery } from '@tanstack/react-query';
import { discussionService } from '../api/discussion.service';
import { discussionQueryKeys } from '../api/discussion-keys';

export const useDiscussionReplies = (courseId: string, parentId: string | null) => {
    return useQuery({
        queryKey: parentId ? discussionQueryKeys.replies(courseId, parentId) : [],
        queryFn: async () => {
            if (!parentId) throw new Error('Missing parentId');
            return discussionService.getReplies(parentId, courseId);
        },
        enabled: !!parentId && !!courseId,
        staleTime: 1000 * 60 * 5,
    });
};