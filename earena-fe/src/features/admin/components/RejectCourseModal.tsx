'use client';

import { useForm } from 'react-hook-form';
import { rhfZodResolver as zodResolver } from '@/shared/lib/rhf-zod-resolver';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import { useRejectCourse } from '../hooks/useAdminCourses';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';

const rejectSchema = z.object({
    reason: z.string().min(10, 'Lý do từ chối phải có ít nhất 10 ký tự để giáo viên dễ khắc phục.'),
});

type RejectFormDTO = z.infer<typeof rejectSchema>;

interface RejectCourseModalProps {
    courseId: string | null;
    isOpen: boolean;
    onClose: () => void;
}

export function RejectCourseModal({ courseId, isOpen, onClose }: RejectCourseModalProps) {
    const { mutate: rejectCourse, isPending } = useRejectCourse();
    const { register, handleSubmit, formState: { errors }, reset } = useForm<RejectFormDTO>({
        resolver: zodResolver(rejectSchema),
        defaultValues: { reason: '' }
    });

    useEffect(() => {
        if (isOpen) reset();
    }, [isOpen, reset]);

    const onSubmit = (data: RejectFormDTO) => {
        if (!courseId) return;
        rejectCourse({ id: courseId, payload: { reason: data.reason } }, {
            onSuccess: () => onClose()
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && !isPending && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-xl text-red-600">Từ chối xuất bản</DialogTitle>
                    <DialogDescription>
                        Vui lòng nhập lý do từ chối để giáo viên có thể chỉnh sửa và nộp lại.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Textarea
                            {...register('reason')}
                            placeholder="Ví dụ: Thiếu video giới thiệu, bài học số 2 chưa có nội dung..."
                            className="h-24 resize-none"
                            disabled={isPending}
                        />
                        {errors.reason && <p className="text-sm text-red-500 font-medium">{errors.reason.message}</p>}
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button type="button" variant="ghost" onClick={onClose} disabled={isPending}>Hủy</Button>
                        <Button type="submit" variant="destructive" disabled={isPending}>
                            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Xác nhận từ chối
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}