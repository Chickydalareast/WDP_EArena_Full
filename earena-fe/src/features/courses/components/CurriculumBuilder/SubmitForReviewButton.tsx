'use client';

import { Button } from '@/shared/components/ui/button';
import { useSubmitForReview } from '../../hooks/useCurriculumMutations';
import { Send, Loader2, CheckCircle2 } from 'lucide-react';
import { CourseStatus } from '../../types/course.schema';

interface SubmitForReviewButtonProps {
    courseId: string;
    status?: CourseStatus;
}

export function SubmitForReviewButton({ courseId, status = CourseStatus.DRAFT }: SubmitForReviewButtonProps) {
    const { mutate: submitForReview, isPending } = useSubmitForReview(courseId);

    if (status === CourseStatus.PENDING_REVIEW) {
        return (
            <Button disabled variant="outline" className="font-semibold border-yellow-400 text-yellow-600 bg-yellow-50">
                <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                Đang chờ duyệt
            </Button>
        );
    }

    if (status === CourseStatus.PUBLISHED) {
        return (
            <Button disabled variant="outline" className="font-semibold border-green-400 text-green-600 bg-green-50">
                <CheckCircle2 className="mr-2 w-4 h-4" />
                Đang On Air
            </Button>
        );
    }

    return (
        <Button
            onClick={() => submitForReview()}
            disabled={isPending}
            className="font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all active:scale-95"
        >
            {isPending ? <Loader2 className="mr-2 w-4 h-4 animate-spin" /> : <Send className="mr-2 w-4 h-4" />}
            Gửi yêu cầu kiểm duyệt
        </Button>
    );
}