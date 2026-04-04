'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForceTakedownModal = ForceTakedownModal;
const react_1 = require("react");
const react_hook_form_1 = require("react-hook-form");
const rhf_zod_resolver_1 = require("@/shared/lib/rhf-zod-resolver");
const zod_1 = require("zod");
const dialog_1 = require("@/shared/components/ui/dialog");
const button_1 = require("@/shared/components/ui/button");
const textarea_1 = require("@/shared/components/ui/textarea");
const useAdminCourses_1 = require("../hooks/useAdminCourses");
const lucide_react_1 = require("lucide-react");
const takedownSchema = zod_1.z.object({
    reason: zod_1.z.string().min(5, 'Lý do vi phạm phải dài ít nhất 5 ký tự để ghi log.'),
});
function ForceTakedownModal({ courseId, courseTitle, isOpen, onClose }) {
    const { mutateAsync: forceTakedown, isPending } = (0, useAdminCourses_1.useForceTakedownCourse)();
    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = (0, react_hook_form_1.useForm)({
        resolver: (0, rhf_zod_resolver_1.rhfZodResolver)(takedownSchema),
        defaultValues: { reason: '' }
    });
    (0, react_1.useEffect)(() => {
        if (isOpen)
            reset();
    }, [isOpen, reset]);
    const onSubmit = async (data) => {
        if (!courseId)
            return;
        try {
            await forceTakedown({ id: courseId, payload: { reason: data.reason } });
            onClose();
        }
        catch (error) {
            console.error("Force Takedown Error:", error);
        }
    };
    const isLocked = isPending || isSubmitting;
    return (<dialog_1.Dialog open={isOpen} onOpenChange={(open) => !open && !isLocked && onClose()}>
            <dialog_1.DialogContent className="border-red-500/50 sm:max-w-md">
                <dialog_1.DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                            <lucide_react_1.AlertOctagon className="size-5 text-red-600 dark:text-red-500"/>
                        </div>
                        <div>
                            <dialog_1.DialogTitle className="text-xl text-red-600 dark:text-red-500 font-bold">Gỡ Khóa Học Khẩn Cấp</dialog_1.DialogTitle>
                        </div>
                    </div>
                    <dialog_1.DialogDescription className="pt-3 text-sm text-foreground">
                        Hành động này sẽ <strong className="text-red-600">lập tức ẩn</strong> khóa học <strong className="font-bold">{courseTitle || 'này'}</strong> khỏi nền tảng, xóa bộ nhớ đệm (Cache) và gửi email cảnh cáo vi phạm đến Giáo viên.
                    </dialog_1.DialogDescription>
                </dialog_1.DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
                    <div className="space-y-2 bg-red-50 dark:bg-red-950/10 p-4 rounded-lg border border-red-100 dark:border-red-900/30">
                        <label className="text-sm font-bold text-red-900 dark:text-red-400">
                            Lý do gỡ (Bắt buộc) <span className="text-red-500">*</span>
                        </label>
                        <textarea_1.Textarea {...register('reason')} placeholder="VD: Vi phạm bản quyền, nội dung phản cảm, sai lệch kiến thức nghiêm trọng..." className="h-24 resize-none bg-background focus-visible:ring-red-500" disabled={isLocked}/>
                        {errors.reason && <p className="text-xs text-red-600 font-semibold">{errors.reason.message}</p>}
                    </div>

                    <div className="flex justify-end gap-3 pt-2 border-t border-border">
                        <button_1.Button type="button" variant="outline" onClick={onClose} disabled={isLocked}>Hủy thao tác</button_1.Button>
                        <button_1.Button type="submit" variant="destructive" disabled={isLocked} className="font-bold shadow-md">
                            {isLocked && <lucide_react_1.Loader2 className="w-4 h-4 mr-2 animate-spin"/>}
                            Xác nhận Gỡ bỏ
                        </button_1.Button>
                    </div>
                </form>
            </dialog_1.DialogContent>
        </dialog_1.Dialog>);
}
//# sourceMappingURL=ForceTakedownModal.js.map