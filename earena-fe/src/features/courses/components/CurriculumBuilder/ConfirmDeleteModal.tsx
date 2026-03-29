import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { useDeleteSection, useDeleteLesson } from '../../hooks/useCurriculumMutations';

interface ConfirmDeleteModalProps {
  courseId: string;
  isOpen: boolean;
  onClose: () => void;
  config: { type: 'SECTION' | 'LESSON'; id: string; name: string; sectionId?: string } | null;
}

export function ConfirmDeleteModal({ courseId, isOpen, onClose, config }: ConfirmDeleteModalProps) {
  const { mutate: deleteSection, isPending: isDeletingSec } = useDeleteSection(courseId);
  const { mutate: deleteLesson, isPending: isDeletingLes } = useDeleteLesson(courseId);
  
  const isPending = isDeletingSec || isDeletingLes;

  const handleConfirm = () => {
    if (!config) return;
    if (config.type === 'SECTION') {
      deleteSection(config.id, { onSuccess: onClose });
    } else {
      deleteLesson(config.id, { onSuccess: onClose }); // Truyền lessonId
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-red-600">Xác nhận xóa</DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn xóa {config?.type === 'SECTION' ? 'chương' : 'bài học'} <strong className="text-foreground">"{config?.name}"</strong> không?
            {config?.type === 'SECTION' && (
              <span className="block mt-2 font-bold text-red-500">CẢNH BÁO: Toàn bộ bài học bên trong chương này sẽ bị xóa vĩnh viễn!</span>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>Hủy</Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isPending}>Xóa vĩnh viễn</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}