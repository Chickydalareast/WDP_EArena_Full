import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewService } from '../api/review.service';
import { courseQueryKeys } from '../api/course-keys';
import { PublicCourseDetail } from '../types/course.schema';
import { toast } from 'sonner';

interface ApiError {
    statusCode: number;
    message: string;
    errors?: Record<string, string[]>;
}

export const useCreateReview = (courseId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: Parameters<typeof reviewService.createReview>[1]) => 
            reviewService.createReview(courseId, payload),
        onSuccess: (response) => {
            toast.success('Cảm ơn bạn đã đánh giá khóa học!');

            queryClient.setQueryData<PublicCourseDetail>(
                courseQueryKeys.publicDetail(courseId),
                (oldData) => {
                    if (!oldData) return oldData;
                    return {
                        ...oldData,
                        averageRating: response.stats.averageRating,
                        totalReviews: response.stats.totalReviews,
                    };
                }
            );

            queryClient.invalidateQueries({
                queryKey: courseQueryKeys.studyTree(courseId),
            });

            queryClient.invalidateQueries({
                queryKey: courseQueryKeys.reviewLists(courseId),
            });
        },
        onError: (error: ApiError) => {
            toast.error(error.message || 'Có lỗi xảy ra, vui lòng thử lại sau.');
        }
    });
};

export const useReplyReview = (courseId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ reviewId, payload }: { reviewId: string; payload: Parameters<typeof reviewService.replyReview>[2] }) => 
            reviewService.replyReview(courseId, reviewId, payload),
        onSuccess: () => {
            toast.success('Gửi phản hồi thành công.');
            
            queryClient.invalidateQueries({
                queryKey: courseQueryKeys.reviewLists(courseId),
            });
        },
        onError: (error: ApiError) => {
            toast.error(error.message || 'Không thể gửi phản hồi.');
        }
    });
};