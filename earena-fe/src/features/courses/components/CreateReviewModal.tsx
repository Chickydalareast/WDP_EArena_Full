'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';

import { createReviewSchema, CreateReviewDTO } from '../types/review.schema';
import { useCreateReview } from '../hooks/useReviewMutations';
import { StarRating } from './StarRating';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
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

interface CreateReviewModalProps {
    courseId: string;
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    message?: string;
}

export const CreateReviewModal = ({ courseId, isOpen, onClose, title, message }: CreateReviewModalProps) => {
    const { mutate: createReview, isPending } = useCreateReview(courseId);

    const form = useForm<CreateReviewDTO>({
        resolver: zodResolver(createReviewSchema),
        defaultValues: {
            rating: 0, // Cố tình để 0 để ép user phải click chọn sao (validate min 1)
            comment: '',
        },
    });

    const handleOpenChange = (open: boolean) => {
        if (isPending) return; // Chặn đóng khi đang call API
        if (!open) {
            form.reset();
            // Đóng lại là auto ghi cờ chống làm phiền
            localStorage.setItem(`has_dismissed_review_${courseId}`, 'true');
            onClose();
        }
    };

    const onSubmit = (data: CreateReviewDTO) => {
        createReview(data, {
            onSuccess: () => {
                form.reset();
                localStorage.setItem(`has_dismissed_review_${courseId}`, 'true'); // Đã nộp thì khóa vĩnh viễn
                onClose();
                // Không cần Invalidate ở đây vì đã xử lý Optimistic Update tập trung ở useCreateReview
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{title || 'Đánh giá khóa học'}</DialogTitle>
                    <DialogDescription>
                        {message || 'Chia sẻ cảm nhận của bạn để giúp học viên khác hiểu hơn về khóa học này nhé. (Bạn chỉ có thể đánh giá 1 lần duy nhất).'}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">

                        {/* Chèn Custom StarRating vào FormField chuẩn Shadcn */}
                        <FormField
                            control={form.control}
                            name="rating"
                            render={({ field }) => (
                                <FormItem className="flex flex-col items-center justify-center space-y-3 py-4 border rounded-lg bg-muted/20">
                                    <FormLabel className="text-base font-medium">Bạn đánh giá bao nhiêu sao?</FormLabel>
                                    <FormControl>
                                        <StarRating
                                            value={field.value}
                                            onChange={field.onChange}
                                            size={32}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="comment"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nhận xét chi tiết (Không bắt buộc)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Khóa học này đã giúp ích gì cho bạn?..."
                                            className="resize-none h-24"
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
                                Hủy bỏ
                            </Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Gửi đánh giá
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};