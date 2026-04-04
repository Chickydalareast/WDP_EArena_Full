"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfirmDeleteModal = ConfirmDeleteModal;
const dialog_1 = require("@/shared/components/ui/dialog");
const button_1 = require("@/shared/components/ui/button");
const useCurriculumMutations_1 = require("../../hooks/useCurriculumMutations");
function ConfirmDeleteModal({ courseId, isOpen, onClose, config }) {
    const { mutate: deleteSection, isPending: isDeletingSec } = (0, useCurriculumMutations_1.useDeleteSection)(courseId);
    const { mutate: deleteLesson, isPending: isDeletingLes } = (0, useCurriculumMutations_1.useDeleteLesson)(courseId);
    const isPending = isDeletingSec || isDeletingLes;
    const handleConfirm = () => {
        if (!config)
            return;
        if (config.type === 'SECTION') {
            deleteSection(config.id, { onSuccess: onClose });
        }
        else {
            deleteLesson(config.id, { onSuccess: onClose });
        }
    };
    return (<dialog_1.Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <dialog_1.DialogContent>
        <dialog_1.DialogHeader>
          <dialog_1.DialogTitle className="text-red-600">Xác nhận xóa</dialog_1.DialogTitle>
          <dialog_1.DialogDescription>
            Bạn có chắc chắn muốn xóa {config?.type === 'SECTION' ? 'chương' : 'bài học'} <strong className="text-foreground">"{config?.name}"</strong> không?
            {config?.type === 'SECTION' && (<span className="block mt-2 font-bold text-red-500">CẢNH BÁO: Toàn bộ bài học bên trong chương này sẽ bị xóa vĩnh viễn!</span>)}
          </dialog_1.DialogDescription>
        </dialog_1.DialogHeader>
        <dialog_1.DialogFooter>
          <button_1.Button variant="outline" onClick={onClose} disabled={isPending}>Hủy</button_1.Button>
          <button_1.Button variant="destructive" onClick={handleConfirm} disabled={isPending}>Xóa vĩnh viễn</button_1.Button>
        </dialog_1.DialogFooter>
      </dialog_1.DialogContent>
    </dialog_1.Dialog>);
}
//# sourceMappingURL=ConfirmDeleteModal.js.map