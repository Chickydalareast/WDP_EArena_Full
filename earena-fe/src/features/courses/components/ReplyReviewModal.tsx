'use client';

import { useForm } from 'react-hook-form';
import { rhfZodResolver as zodResolver } from '@/shared/lib/rhf-zod-resolver';
import { Loader2 } from 'lucide-react';

import { replyReviewSchema, ReplyReviewDTO } from '../types/review.schema';
import { useReplyReview } from '../hooks/useReviewMutations';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/shared/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/shared/components/ui/form';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';

interface ReplyReviewModalProps {
    courseId: string;
    reviewId: string | null;
    onClose: () => void;
}

export const ReplyReviewModal = ({ courseId, reviewId, onClose }: ReplyReviewModalProps) => {
    const { mutate: replyReview, isPending } = useReplyReview(courseId);

    const form = useForm<ReplyReviewDTO>({
        resolver: zodResolver(replyReviewSchema),
        defaultValues: {
            reply: '',
        },
    });

    const isOpen = !!reviewId;

    const handleOpenChange = (open: boolean) => {
        if (isPending) return;
        if (!open) {
            form.reset();
            onClose();
        }
    };

    const onSubmit = (data: ReplyReviewDTO) => {
        if (!reviewId) return;

        replyReview(
            { reviewId, payload: data },
            {
                onSuccess: () => {
                    form.reset();
                    onClose();
                },
            }
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Phản hồi học viên</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                        <FormField
                            control={form.control}
                            name="reply"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nội dung phản hồi</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Cảm ơn bạn đã góp ý..."
                                            className="resize-none h-32"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => handleOpenChange(false)}
                                disabled={isPending}
                            >
                                Hủy
                            </Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Gửi phản hồi
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};