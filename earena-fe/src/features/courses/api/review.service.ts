import { axiosClient } from '@/shared/lib/axios-client';
import { API_ENDPOINTS } from '@/config/api-endpoints';
import {
    CourseReviewItem,
    CreateReviewDTO,
    GetCourseReviewsResponse,
    ReplyReviewDTO
} from '../types/review.schema';

export const reviewService = {

    getCourseReviews: async (courseId: string, params: { page: number; limit: number }) => {
        return axiosClient.get<
            unknown,
            { data: CourseReviewItem[]; meta: GetCourseReviewsResponse['meta'] }
        >(
            API_ENDPOINTS.COURSES.REVIEWS(courseId),
            { params }
        );
    },


    createReview: async (courseId: string, payload: CreateReviewDTO) => {
        return axiosClient.post<
            unknown,
            { stats: { averageRating: number; totalReviews: number } }
        >(
            API_ENDPOINTS.COURSES.REVIEWS(courseId),
            payload
        );
    },

    replyReview: async (courseId: string, reviewId: string, payload: ReplyReviewDTO) => {
        return axiosClient.patch<unknown, void>(
            API_ENDPOINTS.COURSES.REVIEW_REPLY(courseId, reviewId),
            payload
        );
    }
};