import { CourseReviewItem, GetCourseReviewsResponse } from '../types/review.schema';
import { ReviewItem, ReviewItemSkeleton } from './ReviewItem';
import { Button } from '@/shared/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ReviewListProps {
    reviews: CourseReviewItem[];
    isLoading: boolean;
    meta?: GetCourseReviewsResponse['meta'];
    isTeacher?: boolean;
    onPageChange?: (page: number) => void;
    onReplyClick?: (reviewId: string) => void;
}

export const ReviewList = ({
    reviews,
    isLoading,
    meta,
    isTeacher,
    onPageChange,
    onReplyClick
}: ReviewListProps) => {

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => <ReviewItemSkeleton key={i} />)}
            </div>
        );
    }

    if (!reviews.length) {
        return (
            <div className="text-center py-12 px-4 border rounded-xl bg-muted/10 border-dashed">
                <p className="text-sm text-muted-foreground">
                    Chưa có đánh giá nào cho khóa học này.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                {reviews.map(review => (
                    <ReviewItem
                        key={review.id}
                        review={review}
                        isTeacher={isTeacher}
                        onReplyClick={onReplyClick}
                    />
                ))}
            </div>

            {/* Pagination Controls */}
            {meta && meta.totalPages > 1 && onPageChange && (
                <div className="flex items-center justify-center gap-4 pt-4 border-t">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={meta.currentPage === 1}
                        onClick={() => onPageChange(meta.currentPage - 1)}
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" /> Trước
                    </Button>

                    <span className="text-sm font-medium text-muted-foreground">
                        Trang {meta.currentPage} / {meta.totalPages}
                    </span>

                    <Button
                        variant="outline"
                        size="sm"
                        disabled={meta.currentPage === meta.totalPages}
                        onClick={() => onPageChange(meta.currentPage + 1)}
                    >
                        Sau <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                </div>
            )}
        </div>
    );
};