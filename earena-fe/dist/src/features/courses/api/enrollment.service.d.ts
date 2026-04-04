import { MyLearningResponse } from '../types/enrollment.schema';
export declare const enrollmentService: {
    getMyLearning: (page?: number, limit?: number) => Promise<MyLearningResponse>;
};
