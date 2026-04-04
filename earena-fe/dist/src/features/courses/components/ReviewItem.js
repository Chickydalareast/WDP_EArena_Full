"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewItemSkeleton = exports.ReviewItem = void 0;
const StarRating_1 = require("./StarRating");
const button_1 = require("@/shared/components/ui/button");
const skeleton_1 = require("@/shared/components/ui/skeleton");
const date_fns_1 = require("date-fns");
const lucide_react_1 = require("lucide-react");
const ReviewItem = ({ review, isTeacher, onReplyClick }) => {
    return (<div className="flex gap-4 p-5 border rounded-xl bg-card text-card-foreground shadow-sm">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden border">
                {review.user.avatar ? (<img src={review.user.avatar} alt={review.user.fullName} className="w-full h-full object-cover"/>) : (<lucide_react_1.User size={24} className="text-muted-foreground"/>)}
            </div>

            <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="font-semibold text-sm leading-none">{review.user.fullName}</p>
                        <div className="flex items-center gap-2 mt-2">
                            <StarRating_1.StarRating value={review.rating} readonly size={14}/>
                            <span className="text-xs text-muted-foreground">
                                {(0, date_fns_1.format)(new Date(review.createdAt), 'dd/MM/yyyy')}
                            </span>
                        </div>
                    </div>

                    
                    {isTeacher && !review.teacherReply && onReplyClick && (<button_1.Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => onReplyClick(review.id)}>
                            <lucide_react_1.MessageSquareReply className="w-4 h-4 mr-2"/>
                            Phản hồi
                        </button_1.Button>)}
                </div>

                {review.comment && (<p className="text-sm text-foreground/90 mt-3 leading-relaxed">
                        {review.comment}
                    </p>)}

                {review.teacherReply && (<div className="mt-4 p-4 bg-muted/40 rounded-lg border-l-4 border-l-primary/60">
                        <p className="text-xs font-bold mb-2 flex items-center gap-2 text-primary/80">
                            <lucide_react_1.MessageSquareReply size={14}/>
                            Giáo viên phản hồi:
                        </p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {review.teacherReply}
                        </p>
                        {review.repliedAt && (<p className="text-[11px] text-muted-foreground mt-3">
                                {(0, date_fns_1.format)(new Date(review.repliedAt), 'dd/MM/yyyy HH:mm')}
                            </p>)}
                    </div>)}
            </div>
        </div>);
};
exports.ReviewItem = ReviewItem;
const ReviewItemSkeleton = () => (<div className="flex gap-4 p-5 border rounded-xl shadow-sm">
        <skeleton_1.Skeleton className="w-12 h-12 rounded-full"/>
        <div className="flex-1 space-y-4">
            <skeleton_1.Skeleton className="h-4 w-1/3"/>
            <skeleton_1.Skeleton className="h-3 w-24"/>
            <skeleton_1.Skeleton className="h-16 w-full mt-4"/>
        </div>
    </div>);
exports.ReviewItemSkeleton = ReviewItemSkeleton;
//# sourceMappingURL=ReviewItem.js.map