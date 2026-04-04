'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateCourseModal = CreateCourseModal;
const react_hook_form_1 = require("react-hook-form");
const rhf_zod_resolver_1 = require("@/shared/lib/rhf-zod-resolver");
const dialog_1 = require("@/shared/components/ui/dialog");
const button_1 = require("@/shared/components/ui/button");
const input_1 = require("@/shared/components/ui/input");
const textarea_1 = require("@/shared/components/ui/textarea");
const course_schema_1 = require("../types/course.schema");
const useTeacherCourses_1 = require("../hooks/useTeacherCourses");
const lucide_react_1 = require("lucide-react");
function CreateCourseModal({ isOpen, onClose }) {
    const { mutate: createCourse, isPending } = (0, useTeacherCourses_1.useCreateCourse)();
    const { register, handleSubmit, formState: { errors }, reset } = (0, react_hook_form_1.useForm)({
        resolver: (0, rhf_zod_resolver_1.rhfZodResolver)(course_schema_1.createCourseSchema),
        defaultValues: { title: '', price: 0, description: '' },
    });
    const onSubmit = (data) => {
        createCourse(data, {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };
    return (<dialog_1.Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <dialog_1.DialogContent className="sm:max-w-[550px]">
        <dialog_1.DialogHeader>
          <dialog_1.DialogTitle className="flex items-center gap-2">
            <lucide_react_1.PlusCircle className="w-5 h-5 text-primary"/> Tạo khóa học mới
          </dialog_1.DialogTitle>
          <dialog_1.DialogDescription>
            Điền thông tin cơ bản để khởi tạo khóa học. Bạn có thể thay đổi sau trong phần Cài đặt.
          </dialog_1.DialogDescription>
        </dialog_1.DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Tên khóa học <span className="text-red-500">*</span></label>
            <input_1.Input {...register('title')} placeholder="VD: Luyện thi THPTQG Toán Học" disabled={isPending}/>
            {errors.title && <p className="text-[12px] font-medium text-red-500">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Giá bán (VNĐ) <span className="text-red-500">*</span></label>
            <input_1.Input type="number" {...register('price')} placeholder="VD: 500000" disabled={isPending}/>
            {errors.price && <p className="text-[12px] font-medium text-red-500">{errors.price.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Mô tả ngắn</label>
            <textarea_1.Textarea {...register('description')} placeholder="Tổng quan về khóa học..." rows={3} disabled={isPending}/>
            {errors.description && <p className="text-[12px] font-medium text-red-500">{errors.description.message}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button_1.Button type="button" variant="outline" onClick={onClose} disabled={isPending}>Hủy</button_1.Button>
            <button_1.Button type="submit" disabled={isPending}>
              {isPending && <lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
              Khởi tạo Khóa học
            </button_1.Button>
          </div>
        </form>
      </dialog_1.DialogContent>
    </dialog_1.Dialog>);
}
//# sourceMappingURL=CreateCourseModal.js.map