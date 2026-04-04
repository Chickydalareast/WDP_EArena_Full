import { z } from 'zod';
export const SortOptionEnum = z.enum(['recent', 'popular']);
export type SortOption = z.infer<typeof SortOptionEnum>;

export interface DiscussionUser {
    id: string;
    fullName: string;
    avatar?: string | null;
    role?: 'TEACHER' | 'STUDENT' | 'ADMIN';
}

export interface DiscussionAttachment {
    id: string;
    url: string;
    mimetype?: string;
}

export interface RootQuestion {
    id: string;
    content: string;
    replyCount: number;
    lastRepliedAt: string | null;
    createdAt: string;
    user: DiscussionUser;
    attachments?: DiscussionAttachment[];
    
    lesson?: {
        id: string;
        title: string;
        section?: DiscussionSectionInfo | null;
    };
}

export interface DiscussionReply {
    id: string;
    content: string;
    createdAt: string;
    user: DiscussionUser;
    attachments?: DiscussionAttachment[];
}

export interface GetQuestionsResponse {
    message: string;
    data: RootQuestion[];
    meta: {
        total: number;
        page: number;
        limit: number;
    };
}

export interface GetRepliesResponse {
    message: string;
    data: DiscussionReply[];
}

export const createDiscussionSchema = z.object({
    courseId: z.string().min(1, 'Thiếu thông tin khóa học'),
    lessonId: z.string().min(1, 'Thiếu thông tin bài học'),
    content: z.string()
        .min(1, 'Nội dung không được để trống')
        .max(3000, 'Nội dung thảo luận không được vượt quá 3000 ký tự'),
    attachments: z.array(z.string()).optional(),
});

export type CreateQuestionDTO = z.infer<typeof createDiscussionSchema>;

export const createReplySchema = createDiscussionSchema.extend({
    parentId: z.string().min(1, 'Thiếu thông tin câu hỏi gốc'),
});

export type CreateReplyDTO = z.infer<typeof createReplySchema>;

export interface GetQuestionsParams {
    courseId: string;
    page?: number;
    limit?: number;
    sortBy?: SortOption;
}

export type DiscussionFilter = 'all' | 'unanswered';

export interface RootQuestion {
    id: string;
    content: string;
    replyCount: number;
    lastRepliedAt: string | null;
    createdAt: string;
    user: DiscussionUser;
    attachments?: DiscussionAttachment[];
    lesson?: {
        id: string;
        title: string;
    };
}

export interface GetCourseQuestionsParams {
    page?: number;
    limit?: number;
    sortBy?: SortOption;
    filter?: DiscussionFilter;
}

export interface DiscussionSectionInfo {
    id: string;
    title: string;
}