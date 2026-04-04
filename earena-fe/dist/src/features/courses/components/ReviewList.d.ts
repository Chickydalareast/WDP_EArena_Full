import { CourseReviewItem, GetCourseReviewsResponse } from '../types/review.schema';
interface ReviewListProps {
    reviews: CourseReviewItem[];
    isLoading: boolean;
    meta?: GetCourseReviewsResponse['meta'];
    isTeacher?: boolean;
    onPageChange?: (page: number) => void;
    onReplyClick?: (reviewId: string) => void;
}
export declare const ReviewList: ({ reviews, isLoading, meta, isTeacher, onPageChange, onReplyClick }: ReviewListProps) => any;
export {};
