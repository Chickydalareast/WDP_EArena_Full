'use client';

import { useForm, type Resolver } from 'react-hook-form';
import { rhfZodResolver as zodResolver } from '@/shared/lib/rhf-zod-resolver';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { createCourseSchema, CreateCourseDTO } from '../types/course.schema';
import { useCreateCourse } from '../hooks/useTeacherCourses';
import { Loader2, PlusCircle } from 'lucide-react';

interface CreateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateCourseModal({ isOpen, onClose }: CreateCourseModalProps) {
  const { mutate: createCourse, isPending } = useCreateCourse();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<CreateCourseDTO>({
    resolver: zodResolver(createCourseSchema) as Resolver<CreateCourseDTO>,
    defaultValues: { title: '', price: 0, description: '' },
  });

  const onSubmit = (data: CreateCourseDTO) => {
    createCourse(data, {
      onSuccess: () => {
        reset();
        onClose();
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-primary" /> Tạo khóa học mới
          </DialogTitle>
          <DialogDescription>
            Điền thông tin cơ bản để khởi tạo khóa học. Bạn có thể thay đổi sau trong phần Cài đặt.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Tên khóa học <span className="text-red-500">*</span></label>
            <Input {...register('title')} placeholder="VD: Luyện thi THPTQG Toán Học" disabled={isPending} />
            {errors.title && <p className="text-[12px] font-medium text-red-500">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Giá bán (VNĐ) <span className="text-red-500">*</span></label>
            <Input type="number" {...register('price')} placeholder="VD: 500000" disabled={isPending} />
            {errors.price && <p className="text-[12px] font-medium text-red-500">{errors.price.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Mô tả ngắn</label>
            <Textarea {...register('description')} placeholder="Tổng quan về khóa học..." rows={3} disabled={isPending} />
            {errors.description && <p className="text-[12px] font-medium text-red-500">{errors.description.message}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>Hủy</Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Khởi tạo Khóa học
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}