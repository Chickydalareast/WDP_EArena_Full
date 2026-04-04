// File: src/modules/courses/interfaces/lesson-discussion.interface.ts

import { Types } from 'mongoose';

export interface CreateDiscussionPayload {
    courseId: string;
    lessonId: string;
    userId: string;
    content: string;
    attachments?: string[];
}

export interface ReplyDiscussionPayload {
    courseId: string;
    lessonId: string;
    userId: string;
    parentId: string;
    content: string;
    attachments?: string[];
}

export interface GetDiscussionsParams {
    userId: string;
    courseId: string;
    lessonId: string;
    page: number;
    limit: number;
    sortBy?: 'recent' | 'popular';
}

export interface DiscussionOverview {
    id: string;
    content: string;
    replyCount: number;
    lastRepliedAt: Date | null;
    createdAt: Date;
    user: {
        id: string;
        fullName: string;
        avatar: string | null;
    };
    attachments: Array<{
        id: string;
        url: string;
        mimetype: string;
    }>;
}

export interface GetCourseDiscussionsParams {
    userId: string;
    courseId: string;
    page: number;
    limit: number;
    sortBy?: 'recent' | 'popular';
    filter?: 'all' | 'unanswered';
}

export interface CourseDiscussionOverview extends DiscussionOverview {
    lesson: {
        id: string;
        title: string;
        section: {
            id: string;
            title: string;
        } | null;
    };
}