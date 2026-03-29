'use client';

import { useState } from 'react';
import { useCourseReviews } from '../hooks/useReviewQueries';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { ReviewList } from './ReviewList';
import { ReplyReviewModal } from './ReplyReviewModal';
import { AlertCircle } from 'lucide-react';

interface CourseReviewsSectionProps {
    courseId: string;
    teacherId?: string;
}

export const CourseReviewsSection = ({ courseId, teacherId }: CourseReviewsSectionProps) => {
    const [page, setPage] = useState(1);
    const [replyReviewId, setReplyReviewId] = useState<string | null>(null);

    const { data, isLoading, isError } = useCourseReviews({ courseId, page, limit: 5 });

    const currentUser = useAuthStore((state) => state.user);
    const isTeacher = currentUser?.id === teacherId;

    if (isError) {
        return (
            <div className="flex items-center gap-2 p-4 rounded-lg bg-red-50 text-red-600 border border-red-100">
                <AlertCircle className="w-5 h-5" />
                <p className="text-sm font-medium">Không thể tải danh sách đánh giá lúc này.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Đánh giá từ học viên</h2>

            <ReviewList
                reviews={data?.data || []}
                meta={data?.meta}
                isLoading={isLoading}
                isTeacher={isTeacher}
                onPageChange={setPage}
                onReplyClick={setReplyReviewId}
            />

            {isTeacher && (
                <ReplyReviewModal
                    courseId={courseId}
                    reviewId={replyReviewId}
                    onClose={() => setReplyReviewId(null)}
                />
            )}
        </div>
    );
};