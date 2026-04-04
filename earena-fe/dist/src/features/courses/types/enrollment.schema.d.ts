import { z } from 'zod';
export declare const MyLearningCourseSchema: any;
export type MyLearningCourse = z.infer<typeof MyLearningCourseSchema>;
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
