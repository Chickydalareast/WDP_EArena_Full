'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Save } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';

import { useAuthStore } from '@/features/auth/stores/auth.store';
import { useCreateExamMatrix } from '../../hooks/useCurriculumMutations';
import { MatrixSectionDTO } from '@/features/exam-builder/types/exam.schema';
import { toast } from 'sonner';

const saveMatrixSchema = z.object({
    title: z.string().min(1, 'Vui lòng nhập tên khuôn mẫu'),
    description: z.string().optional(),
});
type SaveMatrixForm = z.infer<typeof saveMatrixSchema>;

interface SaveMatrixDialogProps {
    isOpen: boolean;
    onClose: () => void;
    currentSections: MatrixSectionDTO[];
    onSuccess: (matrixId: string) => void;
}

export function SaveMatrixDialog({ isOpen, onClose, currentSections, onSuccess }: SaveMatrixDialogProps) {
    const user = useAuthStore(state => state.user);
    const { mutate: createMatrix, isPending } = useCreateExamMatrix();

    const form = useForm<SaveMatrixForm>({
        resolver: zodResolver(saveMatrixSchema),
        defaultValues: { title: '', description: '' }
    });

    const onSubmit = (data: SaveMatrixForm) => {
        const subjectId = user?.subjects?.[0]?.id;
        if (!subjectId) {
            toast.error('Thiếu thông tin Môn học', { description: 'Vui lòng cập nhật môn học giảng dạy trong Hồ sơ.' });
            return;
        }

        const cleanedSections = currentSections.map(section => ({
            ...section,
            rules: section.rules.map(rule => {
                const cleanedRule = { ...rule };
                if (!cleanedRule.questionType) cleanedRule.questionType = 'FLAT';
                if (cleanedRule.questionType !== 'PASSAGE') delete cleanedRule.subQuestionLimit;
                return cleanedRule;
            })
        }));

        createMatrix(
            {
                title: data.title,
                description: data.description,
                subjectId,
                sections: cleanedSections
            },
            {
                onSuccess: (res) => {
                    const newMatrixId = (res as any)?.data?.id || (res as any)?.id;
                    form.reset();
                    onSuccess(newMatrixId);
                }
            }
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Save className="w-5 h-5 text-purple-600" /> Lưu thành Khuôn mẫu
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <FormField control={form.control} name="title" render={({ field }) => (
                            <FormItem>
                                <FormLabel className="font-bold">Tên khuôn mẫu <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                    <Input placeholder="VD: Đề Toán Giữa Kỳ 1 - Mức Cơ Bản" disabled={isPending} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem>
                                <FormLabel className="font-bold">Mô tả chi tiết</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Ghi chú thêm về mục đích của khuôn mẫu này..." disabled={isPending} className="resize-none" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="ghost" onClick={onClose} disabled={isPending}>Hủy</Button>
                            <Button type="submit" disabled={isPending} className="bg-purple-600 hover:bg-purple-700">
                                {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Lưu Khuôn Mẫu
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}