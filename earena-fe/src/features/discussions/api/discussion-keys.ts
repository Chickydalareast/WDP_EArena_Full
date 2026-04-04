import { DiscussionFilter, SortOption } from '../types/discussion.schema';

export const discussionQueryKeys = {
    all: ['discussions'] as const,

    questions: (courseId: string, lessonId: string, sortBy: SortOption) =>
        [...discussionQueryKeys.all, 'questions', courseId, lessonId, sortBy] as const,

    replies: (courseId: string, parentId: string) =>
        [...discussionQueryKeys.all, 'replies', courseId, parentId] as const,

    courseQuestions: (courseId: string, filter: DiscussionFilter, sortBy: SortOption) =>
        [...discussionQueryKeys.all, 'course-questions', courseId, filter, sortBy] as const,
};