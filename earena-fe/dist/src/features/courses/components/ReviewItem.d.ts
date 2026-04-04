import { CourseReviewItem } from '../types/review.schema';
interface ReviewItemProps {
    review: CourseReviewItem;
    isTeacher?: boolean;
    onReplyClick?: (reviewId: string) => void;
}
export declare const ReviewItem: ({ review, isTeacher, onReplyClick }: ReviewItemProps) => any;
export declare const ReviewItemSkeleton: () => any;
export {};
