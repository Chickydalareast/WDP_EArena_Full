'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateSectionModal = CreateSectionModal;
const react_hook_form_1 = require("react-hook-form");
const rhf_zod_resolver_1 = require("@/shared/lib/rhf-zod-resolver");
const dialog_1 = require("@/shared/components/ui/dialog");
const button_1 = require("@/shared/components/ui/button");
const input_1 = require("@/shared/components/ui/input");
const textarea_1 = require("@/shared/components/ui/textarea");
const curriculum_schema_1 = require("../../types/curriculum.schema");
const useCurriculumMutations_1 = require("../../hooks/useCurriculumMutations");
const lucide_react_1 = require("lucide-react");
function CreateSectionModal({ courseId, isOpen, onClose }) {
    const { mutate: createSection, isPending } = (0, useCurriculumMutations_1.useCreateSection)(courseId);
    const { register, handleSubmit, formState: { errors }, reset } = (0, react_hook_form_1.useForm)({
        resolver: (0, rhf_zod_resolver_1.rhfZodResolver)(curriculum_schema_1.createSectionSchema),
        defaultValues: { title: '', description: '' },
    });
    const onSubmit = (data) => {
        createSection(data, {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };
    return (<dialog_1.Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <dialog_1.DialogContent className="sm:max-w-[500px]">
        <dialog_1.DialogHeader>
          <dialog_1.DialogTitle>Thêm Chương Mới</dialog_1.DialogTitle>
        </dialog_1.DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Tên chương <span className="text-red-500">*</span></label>
            <input_1.Input {...register('title')} placeholder="VD: Chương 1: Hàm số" disabled={isPending}/>
            {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Mô tả (Không bắt buộc)</label>
            <textarea_1.Textarea {...register('description')} placeholder="Nhập mô tả ngắn gọn..." disabled={isPending}/>
            {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button_1.Button type="button" variant="outline" onClick={onClose} disabled={isPending}>Hủy</button_1.Button>
            <button_1.Button type="submit" disabled={isPending}>
              {isPending && <lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
              Lưu Chương
            </button_1.Button>
          </div>
        </form>
      </dialog_1.DialogContent>
    </dialog_1.Dialog>);
}
//# sourceMappingURL=CreateSectionModal.js.map