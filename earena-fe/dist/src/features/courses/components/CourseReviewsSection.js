'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseReviewsSection = void 0;
const react_1 = require("react");
const useReviewQueries_1 = require("../hooks/useReviewQueries");
const auth_store_1 = require("@/features/auth/stores/auth.store");
const ReviewList_1 = require("./ReviewList");
const ReplyReviewModal_1 = require("./ReplyReviewModal");
const lucide_react_1 = require("lucide-react");
const CourseReviewsSection = ({ courseId, teacherId }) => {
    const [page, setPage] = (0, react_1.useState)(1);
    const [replyReviewId, setReplyReviewId] = (0, react_1.useState)(null);
    const { data, isLoading, isError } = (0, useReviewQueries_1.useCourseReviews)({ courseId, page, limit: 5 });
    const currentUser = (0, auth_store_1.useAuthStore)((state) => state.user);
    const isTeacher = currentUser?.id === teacherId;
    if (isError) {
        return (<div className="flex items-center gap-2 p-4 rounded-lg bg-red-50 text-red-600 border border-red-100">
                <lucide_react_1.AlertCircle className="w-5 h-5"/>
                <p className="text-sm font-medium">Không thể tải danh sách đánh giá lúc này.</p>
            </div>);
    }
    return (<div className="space-y-6">
            <h2 className="text-2xl font-bold">Đánh giá từ học viên</h2>

            <ReviewList_1.ReviewList reviews={data?.data || []} meta={data?.meta} isLoading={isLoading} isTeacher={isTeacher} onPageChange={setPage} onReplyClick={setReplyReviewId}/>

            {isTeacher && (<ReplyReviewModal_1.ReplyReviewModal courseId={courseId} reviewId={replyReviewId} onClose={() => setReplyReviewId(null)}/>)}
        </div>);
};
exports.CourseReviewsSection = CourseReviewsSection;
//# sourceMappingURL=CourseReviewsSection.js.map