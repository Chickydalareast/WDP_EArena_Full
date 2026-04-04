'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { rhfZodResolver as zodResolver } from '@/shared/lib/rhf-zod-resolver';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import { useForceTakedownCourse } from '../hooks/useAdminCourses';
import { Loader2, AlertOctagon } from 'lucide-react';

const takedownSchema = z.object({
    reason: z.string().min(5, 'Lý do vi phạm phải dài ít nhất 5 ký tự để ghi log.'),
});

type TakedownFormDTO = z.infer<typeof takedownSchema>;

interface ForceTakedownModalProps {
    courseId: string | null;
    courseTitle?: string;
    isOpen: boolean;
    onClose: () => void;
}

export function ForceTakedownModal({ courseId, courseTitle, isOpen, onClose }: ForceTakedownModalProps) {
    const { mutateAsync: forceTakedown, isPending } = useForceTakedownCourse();

    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<TakedownFormDTO>({
        resolver: zodResolver(takedownSchema),
        defaultValues: { reason: '' }
    });

    useEffect(() => {
        if (isOpen) reset();
    }, [isOpen, reset]);

    const onSubmit = async (data: TakedownFormDTO) => {
        if (!courseId) return;

        try {
            await forceTakedown({ id: courseId, payload: { reason: data.reason } });
            onClose();
        } catch (error) {
            console.error("Force Takedown Error:", error);
        }
    };

    const isLocked = isPending || isSubmitting;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && !isLocked && onClose()}>
            <DialogContent className="border-red-500/50 sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                            <AlertOctagon className="size-5 text-red-600 dark:text-red-500" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl text-red-600 dark:text-red-500 font-bold">Gỡ Khóa Học Khẩn Cấp</DialogTitle>
                        </div>
                    </div>
                    <DialogDescription className="pt-3 text-sm text-foreground">
                        Hành động này sẽ <strong className="text-red-600">lập tức ẩn</strong> khóa học <strong className="font-bold">{courseTitle || 'này'}</strong> khỏi nền tảng, xóa bộ nhớ đệm (Cache) và gửi email cảnh cáo vi phạm đến Giáo viên.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
                    <div className="space-y-2 bg-red-50 dark:bg-red-950/10 p-4 rounded-lg border border-red-100 dark:border-red-900/30">
                        <label className="text-sm font-bold text-red-900 dark:text-red-400">
                            Lý do gỡ (Bắt buộc) <span className="text-red-500">*</span>
                        </label>
                        <Textarea
                            {...register('reason')}
                            placeholder="VD: Vi phạm bản quyền, nội dung phản cảm, sai lệch kiến thức nghiêm trọng..."
                            className="h-24 resize-none bg-background focus-visible:ring-red-500"
                            disabled={isLocked}
                        />
                        {errors.reason && <p className="text-xs text-red-600 font-semibold">{errors.reason.message}</p>}
                    </div>

                    <div className="flex justify-end gap-3 pt-2 border-t border-border">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isLocked}>Hủy thao tác</Button>
                        <Button type="submit" variant="destructive" disabled={isLocked} className="font-bold shadow-md">
                            {isLocked && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Xác nhận Gỡ bỏ
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}