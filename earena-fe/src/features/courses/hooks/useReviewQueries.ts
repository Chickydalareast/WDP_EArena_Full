import { useQuery } from '@tanstack/react-query';
import { reviewService } from '../api/review.service';
import { courseQueryKeys } from '../api/course-keys';

interface UseCourseReviewsProps {
    courseId: string;
    page: number;
    limit: number;
}

export const useCourseReviews = ({ courseId, page, limit }: UseCourseReviewsProps) => {
    return useQuery({
        queryKey: [...courseQueryKeys.reviewLists(courseId), { page, limit }],
        queryFn: () => reviewService.getCourseReviews(courseId, { page, limit }),
        enabled: !!courseId,
        staleTime: 1000 * 60 * 5,
    });
};