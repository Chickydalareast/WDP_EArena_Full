'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RejectCourseModal = RejectCourseModal;
const react_hook_form_1 = require("react-hook-form");
const rhf_zod_resolver_1 = require("@/shared/lib/rhf-zod-resolver");
const zod_1 = require("zod");
const dialog_1 = require("@/shared/components/ui/dialog");
const button_1 = require("@/shared/components/ui/button");
const textarea_1 = require("@/shared/components/ui/textarea");
const useAdminCourses_1 = require("../hooks/useAdminCourses");
const lucide_react_1 = require("lucide-react");
const react_1 = require("react");
const rejectSchema = zod_1.z.object({
    reason: zod_1.z.string().min(10, 'Lý do từ chối phải có ít nhất 10 ký tự để giáo viên dễ khắc phục.'),
});
function RejectCourseModal({ courseId, isOpen, onClose }) {
    const { mutate: rejectCourse, isPending } = (0, useAdminCourses_1.useRejectCourse)();
    const { register, handleSubmit, formState: { errors }, reset } = (0, react_hook_form_1.useForm)({
        resolver: (0, rhf_zod_resolver_1.rhfZodResolver)(rejectSchema),
        defaultValues: { reason: '' }
    });
    (0, react_1.useEffect)(() => {
        if (isOpen)
            reset();
    }, [isOpen, reset]);
    const onSubmit = (data) => {
        if (!courseId)
            return;
        rejectCourse({ id: courseId, payload: { reason: data.reason } }, {
            onSuccess: () => onClose()
        });
    };
    return (<dialog_1.Dialog open={isOpen} onOpenChange={(open) => !open && !isPending && onClose()}>
            <dialog_1.DialogContent>
                <dialog_1.DialogHeader>
                    <dialog_1.DialogTitle className="text-xl text-red-600">Từ chối xuất bản</dialog_1.DialogTitle>
                    <dialog_1.DialogDescription>
                        Vui lòng nhập lý do từ chối để giáo viên có thể chỉnh sửa và nộp lại.
                    </dialog_1.DialogDescription>
                </dialog_1.DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <textarea_1.Textarea {...register('reason')} placeholder="Ví dụ: Thiếu video giới thiệu, bài học số 2 chưa có nội dung..." className="h-24 resize-none" disabled={isPending}/>
                        {errors.reason && <p className="text-sm text-red-500 font-medium">{errors.reason.message}</p>}
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button_1.Button type="button" variant="ghost" onClick={onClose} disabled={isPending}>Hủy</button_1.Button>
                        <button_1.Button type="submit" variant="destructive" disabled={isPending}>
                            {isPending && <lucide_react_1.Loader2 className="w-4 h-4 mr-2 animate-spin"/>}
                            Xác nhận từ chối
                        </button_1.Button>
                    </div>
                </form>
            </dialog_1.DialogContent>
        </dialog_1.Dialog>);
}
//# sourceMappingURL=RejectCourseModal.js.map