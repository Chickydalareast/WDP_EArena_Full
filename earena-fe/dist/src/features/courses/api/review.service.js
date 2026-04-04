"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewService = void 0;
const axios_client_1 = require("@/shared/lib/axios-client");
const api_endpoints_1 = require("@/config/api-endpoints");
exports.reviewService = {
    getCourseReviews: async (courseId, params) => {
        return axios_client_1.axiosClient.get(api_endpoints_1.API_ENDPOINTS.COURSES.REVIEWS(courseId), { params });
    },
    createReview: async (courseId, payload) => {
        return axios_client_1.axiosClient.post(api_endpoints_1.API_ENDPOINTS.COURSES.REVIEWS(courseId), payload);
    },
    replyReview: async (courseId, reviewId, payload) => {
        return axios_client_1.axiosClient.patch(api_endpoints_1.API_ENDPOINTS.COURSES.REVIEW_REPLY(courseId, reviewId), payload);
    }
};
//# sourceMappingURL=review.service.js.map