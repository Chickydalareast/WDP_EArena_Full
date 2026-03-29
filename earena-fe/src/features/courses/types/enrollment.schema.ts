import { z } from 'zod';

export const MyLearningCourseSchema = z.object({
    id: z.string(), // ID tiến trình học
    courseId: z.string(),
    progress: z.number().min(0).max(100),
    status: z.string(),
    course: z.object({
        title: z.string(),
        slug: z.string(),
        teacher: z.object({
            fullName: z.string(),
            avatar: z.string().optional().nullable(),
        }),
        coverImage: z.object({
            url: z.string().url(),
            blurHash: z.string().optional().nullable(),
        }).optional().nullable(),
    }),
});

export type MyLearningCourse = z.infer<typeof MyLearningCourseSchema>;

// Payload Response có bọc Meta Pagination
export interface MyLearningResponse {
    data: MyLearningCourse[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}