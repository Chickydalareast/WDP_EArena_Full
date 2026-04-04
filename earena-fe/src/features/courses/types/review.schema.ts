import { z } from 'zod';

export const createReviewSchema = z.object({
    rating: z
        .number({ message: 'Vui lòng chọn số sao đánh giá.' })
        .int('Số sao phải là số nguyên.')
        .min(1, 'Đánh giá tối thiểu 1 sao.')
        .max(5, 'Đánh giá tối đa 5 sao.'),
    comment: z.string().optional(),
});

export type CreateReviewDTO = z.infer<typeof createReviewSchema>;

export const replyReviewSchema = z.object({
    reply: z.string().trim().min(1, 'Nội dung phản hồi không được để trống.'),
});

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