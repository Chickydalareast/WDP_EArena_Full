"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewList = void 0;
const ReviewItem_1 = require("./ReviewItem");
const button_1 = require("@/shared/components/ui/button");
const lucide_react_1 = require("lucide-react");
const ReviewList = ({ reviews, isLoading, meta, isTeacher, onPageChange, onReplyClick }) => {
    if (isLoading) {
        return (<div className="space-y-4">
                {[...Array(3)].map((_, i) => <ReviewItem_1.ReviewItemSkeleton key={i}/>)}
            </div>);
    }
    if (!reviews.length) {
        return (<div className="text-center py-12 px-4 border rounded-xl bg-muted/10 border-dashed">
                <p className="text-sm text-muted-foreground">
                    Chưa có đánh giá nào cho khóa học này.
                </p>
            </div>);
    }
    return (<div className="space-y-6">
            <div className="space-y-4">
                {reviews.map(review => (<ReviewItem_1.ReviewItem key={review.id} review={review} isTeacher={isTeacher} onReplyClick={onReplyClick}/>))}
            </div>

            
            {meta && meta.totalPages > 1 && onPageChange && (<div className="flex items-center justify-center gap-4 pt-4 border-t">
                    <button_1.Button variant="outline" size="sm" disabled={meta.currentPage === 1} onClick={() => onPageChange(meta.currentPage - 1)}>
                        <lucide_react_1.ChevronLeft className="w-4 h-4 mr-1"/> Trước
                    </button_1.Button>

                    <span className="text-sm font-medium text-muted-foreground">
                        Trang {meta.currentPage} / {meta.totalPages}
                    </span>

                    <button_1.Button variant="outline" size="sm" disabled={meta.currentPage === meta.totalPages} onClick={() => onPageChange(meta.currentPage + 1)}>
                        Sau <lucide_react_1.ChevronRight className="w-4 h-4 ml-1"/>
                    </button_1.Button>
                </div>)}
        </div>);
};
exports.ReviewList = ReviewList;
//# sourceMappingURL=ReviewList.js.map