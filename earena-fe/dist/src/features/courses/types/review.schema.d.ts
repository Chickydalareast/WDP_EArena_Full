import { z } from 'zod';
export declare const createReviewSchema: any;
export type CreateReviewDTO = z.infer<typeof createReviewSchema>;
export declare const replyReviewSchema: any;
export type ReplyReviewDTO = z.infer<typeof replyReviewSchema>;
export interface CourseReviewItem {
    id: string;
    rating: number;
    comment: string | null;
    teacherReply: string | null;
    repliedAt: string | null;
    createdAt: string;
    updatedAt: string;
    user: {
        id: string;
        fullName: string;
        avatar: string | null;
    };
}
export interface GetCourseReviewsResponse {
    statusCode: number;
    message: string;
    data: CourseReviewItem[];
    meta: {
        totalItems: number;
        currentPage: number;
        itemsPerPage: number;
        totalPages: number;
    };
}
export interface MyCourseReview {
    id: string;
    rating: number;
    comment: string | null;
    teacherReply: string | null;
    repliedAt: string | null;
    createdAt: string;
}
