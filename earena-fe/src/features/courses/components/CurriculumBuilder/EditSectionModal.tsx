// --- features/courses/components/CurriculumBuilder/EditSectionModal.tsx ---
'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { rhfZodResolver as zodResolver } from '@/shared/lib/rhf-zod-resolver';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { updateSectionSchema, UpdateSectionDTO } from '../../types/curriculum.schema';
import { useUpdateSection } from '../../hooks/useCurriculumMutations';
import { Loader2 } from 'lucide-react';
import { SectionPreview } from '../../types/course.schema';

interface EditSectionModalProps {
  courseId: string;
  section: SectionPreview | null;
  onClose: () => void;
}

export function EditSectionModal({ courseId, section, onClose }: EditSectionModalProps) {
  // Pass '' if section is null to avoid hook errors, it won't be called anyway when closed
  const { mutate: updateSection, isPending } = useUpdateSection(courseId, section?.id || '');

  const { register, handleSubmit, formState: { errors, isDirty }, reset } = useForm<UpdateSectionDTO>({
    resolver: zodResolver(updateSectionSchema),
  });

  useEffect(() => {
    if (section) {
      reset({ title: section.title, description: '' }); // description FE ko có trong tree, tạm để trống hoặc bạn update API getStudyTree để trả về
    }
  }, [section, reset]);

  const onSubmit = (data: UpdateSectionDTO) => {
    updateSection(data, { onSuccess: onClose });
  };

  return (
    <Dialog open={!!section} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader><DialogTitle>Chỉnh sửa Chương</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Tên chương <span className="text-red-500">*</span></label>
            <Input {...register('title')} disabled={isPending} />
            {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>Hủy</Button>
            <Button type="submit" disabled={isPending || !isDirty}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Cập nhật
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}