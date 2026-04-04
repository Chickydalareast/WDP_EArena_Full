'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { rhfZodResolver as zodResolver } from '@/shared/lib/rhf-zod-resolver';
import { FolderPayloadSchema, FolderPayloadDTO, FolderNode } from '../types/question-bank.schema';
import { useCreateFolder, useUpdateFolder, useDeleteFolder } from '../hooks/useFolderMutations';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/shared/components/ui/dialog';
import { Loader2 } from 'lucide-react';

interface FolderModalProps {
    isOpen: boolean;
    onClose: () => void;
    folderToEdit?: FolderNode | null;
    parentIdForNew?: string | null;
}

export function FolderFormModal({ isOpen, onClose, folderToEdit, parentIdForNew }: FolderModalProps) {
    const { mutate: createFolder, isPending: isCreating } = useCreateFolder();
    const { mutate: updateFolder, isPending: isUpdating } = useUpdateFolder();
    const isEdit = !!folderToEdit;

    const form = useForm<FolderPayloadDTO>({
        resolver: zodResolver(FolderPayloadSchema),
        defaultValues: { name: '', description: '', parentId: null },
    });

    useEffect(() => {
        if (isOpen) {
            if (isEdit) {
                form.reset({
                    name: folderToEdit.name,
                    description: folderToEdit.description || '',
                    parentId: folderToEdit.parentId || null,
                });
            } else {
                form.reset({ name: '', description: '', parentId: parentIdForNew || null });
            }
        }
    }, [isOpen, isEdit, folderToEdit, parentIdForNew, form]);

    const onSubmit = (data: FolderPayloadDTO) => {
        if (isEdit) {
            updateFolder(
                { id: folderToEdit._id, data },
                { onSuccess: onClose }
            );
        } else {
            createFolder(data, { onSuccess: onClose });
        }
    };

    const isPending = isCreating || isUpdating;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Chỉnh sửa thư mục' : 'Tạo thư mục mới'}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tên thư mục <span className="text-red-500">*</span></FormLabel>
                                    <FormControl><Input placeholder="Ví dụ: Đề thi thử 2026..." {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Mô tả (Không bắt buộc)</FormLabel>
                                    <FormControl><Textarea placeholder="Ghi chú thêm về thư mục này..." {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter className="mt-6">
                            <Button type="button" variant="ghost" onClick={onClose} disabled={isPending}>Hủy</Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                {isEdit ? 'Lưu thay đổi' : 'Tạo mới'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

export function DeleteFolderConfirmModal({ isOpen, onClose, folderToDelete }: Omit<FolderModalProps, 'parentIdForNew' | 'folderToEdit'> & { folderToDelete?: FolderNode | null }) {
    const { mutate: deleteFolder, isPending } = useDeleteFolder();

    const handleConfirm = () => {
        if (folderToDelete) {
            deleteFolder(folderToDelete._id, { onSuccess: onClose });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-red-600">Xóa thư mục?</DialogTitle>
                    <DialogDescription>
                        Bạn có chắc chắn muốn xóa thư mục <strong>{folderToDelete?.name}</strong> không? Hành động này không thể hoàn tác.
                        <br className="mb-2" />
                        <span className="text-xs text-slate-500">*Lưu ý: Bạn chỉ có thể xóa thư mục rỗng.</span>
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="ghost" onClick={onClose} disabled={isPending}>Hủy</Button>
                    <Button variant="destructive" onClick={handleConfirm} disabled={isPending}>
                        {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Xóa vĩnh viễn
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}