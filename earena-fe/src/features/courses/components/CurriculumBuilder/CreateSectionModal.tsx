'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { createSectionSchema, CreateSectionDTO } from '../../types/curriculum.schema';
import { useCreateSection } from '../../hooks/useCurriculumMutations';
import { Loader2 } from 'lucide-react';

interface CreateSectionModalProps {
  courseId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function CreateSectionModal({ courseId, isOpen, onClose }: CreateSectionModalProps) {
  const { mutate: createSection, isPending } = useCreateSection(courseId);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<CreateSectionDTO>({
    resolver: zodResolver(createSectionSchema),
    defaultValues: { title: '', description: '' },
  });

  const onSubmit = (data: CreateSectionDTO) => {
    createSection(data, {
      onSuccess: () => {
        reset();
        onClose();
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Thêm Chương Mới</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Tên chương <span className="text-red-500">*</span></label>
            <Input {...register('title')} placeholder="VD: Chương 1: Hàm số" disabled={isPending} />
            {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Mô tả (Không bắt buộc)</label>
            <Textarea {...register('description')} placeholder="Nhập mô tả ngắn gọn..." disabled={isPending} />
            {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>Hủy</Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Lưu Chương
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}