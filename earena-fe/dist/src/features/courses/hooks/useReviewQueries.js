"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useCourseReviews = void 0;
const react_query_1 = require("@tanstack/react-query");
const review_service_1 = require("../api/review.service");
const course_keys_1 = require("../api/course-keys");
const useCourseReviews = ({ courseId, page, limit }) => {
    return (0, react_query_1.useQuery)({
        queryKey: [...course_keys_1.courseQueryKeys.reviewLists(courseId), { page, limit }],
        queryFn: () => review_service_1.reviewService.getCourseReviews(courseId, { page, limit }),
        enabled: !!courseId,
        staleTime: 1000 * 60 * 5,
    });
};
exports.useCourseReviews = useCourseReviews;
//# sourceMappingURL=useReviewQueries.js.map