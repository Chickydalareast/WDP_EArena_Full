'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditSectionModal = EditSectionModal;
const react_1 = require("react");
const react_hook_form_1 = require("react-hook-form");
const rhf_zod_resolver_1 = require("@/shared/lib/rhf-zod-resolver");
const dialog_1 = require("@/shared/components/ui/dialog");
const button_1 = require("@/shared/components/ui/button");
const input_1 = require("@/shared/components/ui/input");
const curriculum_schema_1 = require("../../types/curriculum.schema");
const useCurriculumMutations_1 = require("../../hooks/useCurriculumMutations");
const lucide_react_1 = require("lucide-react");
function EditSectionModal({ courseId, section, onClose }) {
    const { mutate: updateSection, isPending } = (0, useCurriculumMutations_1.useUpdateSection)(courseId, section?.id || '');
    const { register, handleSubmit, formState: { errors, isDirty }, reset } = (0, react_hook_form_1.useForm)({
        resolver: (0, rhf_zod_resolver_1.rhfZodResolver)(curriculum_schema_1.updateSectionSchema),
    });
    (0, react_1.useEffect)(() => {
        if (section) {
            reset({ title: section.title, description: '' });
        }
    }, [section, reset]);
    const onSubmit = (data) => {
        updateSection(data, { onSuccess: onClose });
    };
    return (<dialog_1.Dialog open={!!section} onOpenChange={(open) => !open && onClose()}>
      <dialog_1.DialogContent className="sm:max-w-[500px]">
        <dialog_1.DialogHeader><dialog_1.DialogTitle>Chỉnh sửa Chương</dialog_1.DialogTitle></dialog_1.DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Tên chương <span className="text-red-500">*</span></label>
            <input_1.Input {...register('title')} disabled={isPending}/>
            {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button_1.Button type="button" variant="outline" onClick={onClose} disabled={isPending}>Hủy</button_1.Button>
            <button_1.Button type="submit" disabled={isPending || !isDirty}>
              {isPending && <lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
              Cập nhật
            </button_1.Button>
          </div>
        </form>
      </dialog_1.DialogContent>
    </dialog_1.Dialog>);
}
//# sourceMappingURL=EditSectionModal.js.map