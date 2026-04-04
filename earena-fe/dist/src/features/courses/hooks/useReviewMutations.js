"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useReplyReview = exports.useCreateReview = void 0;
const react_query_1 = require("@tanstack/react-query");
const review_service_1 = require("../api/review.service");
const course_keys_1 = require("../api/course-keys");
const sonner_1 = require("sonner");
const useCreateReview = (courseId) => {
    const queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: (payload) => review_service_1.reviewService.createReview(courseId, payload),
        onSuccess: (response) => {
            sonner_1.toast.success('Cảm ơn bạn đã đánh giá khóa học!');
            queryClient.setQueryData(course_keys_1.courseQueryKeys.publicDetail(courseId), (oldData) => {
                if (!oldData)
                    return oldData;
                return {
                    ...oldData,
                    averageRating: response.stats.averageRating,
                    totalReviews: response.stats.totalReviews,
                };
            });
            queryClient.invalidateQueries({
                queryKey: course_keys_1.courseQueryKeys.studyTree(courseId),
            });
            queryClient.invalidateQueries({
                queryKey: course_keys_1.courseQueryKeys.reviewLists(courseId),
            });
        },
        onError: (error) => {
            sonner_1.toast.error(error.message || 'Có lỗi xảy ra, vui lòng thử lại sau.');
        }
    });
};
exports.useCreateReview = useCreateReview;
const useReplyReview = (courseId) => {
    const queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: ({ reviewId, payload }) => review_service_1.reviewService.replyReview(courseId, reviewId, payload),
        onSuccess: () => {
            sonner_1.toast.success('Gửi phản hồi thành công.');
            queryClient.invalidateQueries({
                queryKey: course_keys_1.courseQueryKeys.reviewLists(courseId),
            });
        },
        onError: (error) => {
            sonner_1.toast.error(error.message || 'Không thể gửi phản hồi.');
        }
    });
};
exports.useReplyReview = useReplyReview;
//# sourceMappingURL=useReviewMutations.js.map