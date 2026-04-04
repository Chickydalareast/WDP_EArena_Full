import { CreateReviewDTO, ReplyReviewDTO } from '../types/review.schema';
export declare const reviewService: {
    getCourseReviews: (courseId: string, params: {
        page: number;
        limit: number;
    }) => Promise<any>;
    createReview: (courseId: string, payload: CreateReviewDTO) => Promise<any>;
    replyReview: (courseId: string, reviewId: string, payload: ReplyReviewDTO) => Promise<any>;
};
