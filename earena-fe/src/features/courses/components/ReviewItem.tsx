import { CourseReviewItem } from '../types/review.schema';
import { StarRating } from './StarRating';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { format } from 'date-fns';
import { User, MessageSquareReply } from 'lucide-react';

interface ReviewItemProps {
    review: CourseReviewItem;
    isTeacher?: boolean;
    onReplyClick?: (reviewId: string) => void;
}

export const ReviewItem = ({ review, isTeacher, onReplyClick }: ReviewItemProps) => {
    return (
        <div className="flex gap-4 p-5 border rounded-xl bg-card text-card-foreground shadow-sm">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden border">
                {review.user.avatar ? (
                    <img
                        src={review.user.avatar}
                        alt={review.user.fullName}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <User size={24} className="text-muted-foreground" />
                )}
            </div>

            <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="font-semibold text-sm leading-none">{review.user.fullName}</p>
                        <div className="flex items-center gap-2 mt-2">
                            <StarRating value={review.rating} readonly size={14} />
                            <span className="text-xs text-muted-foreground">
                                {format(new Date(review.createdAt), 'dd/MM/yyyy')}
                            </span>
                        </div>
                    </div>

                    {/* Teacher Action */}
                    {isTeacher && !review.teacherReply && onReplyClick && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => onReplyClick(review.id)}
                        >
                            <MessageSquareReply className="w-4 h-4 mr-2" />
                            Phản hồi
                        </Button>
                    )}
                </div>

                {review.comment && (
                    <p className="text-sm text-foreground/90 mt-3 leading-relaxed">
                        {review.comment}
                    </p>
                )}

                {review.teacherReply && (
                    <div className="mt-4 p-4 bg-muted/40 rounded-lg border-l-4 border-l-primary/60">
                        <p className="text-xs font-bold mb-2 flex items-center gap-2 text-primary/80">
                            <MessageSquareReply size={14} />
                            Giáo viên phản hồi:
                        </p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {review.teacherReply}
                        </p>
                        {review.repliedAt && (
                            <p className="text-[11px] text-muted-foreground mt-3">
                                {format(new Date(review.repliedAt), 'dd/MM/yyyy HH:mm')}
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export const ReviewItemSkeleton = () => (
    <div className="flex gap-4 p-5 border rounded-xl shadow-sm">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="flex-1 space-y-4">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-16 w-full mt-4" />
        </div>
    </div>
);