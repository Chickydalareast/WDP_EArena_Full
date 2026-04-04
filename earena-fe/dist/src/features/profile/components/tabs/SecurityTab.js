'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SecurityTab;
const react_hook_form_1 = require("react-hook-form");
const zod_1 = require("zod");
const rhf_zod_resolver_1 = require("@/shared/lib/rhf-zod-resolver");
const useChangePassword_1 = require("@/features/auth/hooks/useChangePassword");
const button_1 = require("@/shared/components/ui/button");
const input_1 = require("@/shared/components/ui/input");
const label_1 = require("@/shared/components/ui/label");
const sonner_1 = require("sonner");
const SecuritySchema = zod_1.z.object({
    oldPassword: zod_1.z.string().min(6, 'Mật khẩu cũ phải có ít nhất 6 ký tự'),
    newPassword: zod_1.z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự'),
    confirmPassword: zod_1.z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
});
function SecurityTab() {
    const { mutate: changePassword, isPending } = (0, useChangePassword_1.useChangePassword)();
    const { register, handleSubmit, reset, formState: { errors }, } = (0, react_hook_form_1.useForm)({
        resolver: (0, rhf_zod_resolver_1.rhfZodResolver)(SecuritySchema),
    });
    const onSubmit = (data) => {
        changePassword({
            oldPassword: data.oldPassword,
            newPassword: data.newPassword,
        }, {
            onSuccess: () => {
                sonner_1.toast.success('Đổi mật khẩu thành công!');
                reset();
            }
        });
    };
    return (<form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <label_1.Label htmlFor="oldPassword">Mật khẩu hiện tại</label_1.Label>
        <input_1.Input id="oldPassword" type="password" placeholder="••••••••" {...register('oldPassword')} disabled={isPending}/>
        {errors.oldPassword && <p className="text-xs font-medium text-destructive">{errors.oldPassword.message}</p>}
      </div>

      <div className="space-y-2">
        <label_1.Label htmlFor="newPassword">Mật khẩu mới</label_1.Label>
        <input_1.Input id="newPassword" type="password" placeholder="••••••••" {...register('newPassword')} disabled={isPending}/>
        {errors.newPassword && <p className="text-xs font-medium text-destructive">{errors.newPassword.message}</p>}
      </div>

      <div className="space-y-2">
        <label_1.Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</label_1.Label>
        <input_1.Input id="confirmPassword" type="password" placeholder="••••••••" {...register('confirmPassword')} disabled={isPending}/>
        {errors.confirmPassword && <p className="text-xs font-medium text-destructive">{errors.confirmPassword.message}</p>}
      </div>

      <button_1.Button type="submit" variant="destructive" disabled={isPending} className="w-full md:w-auto">
        {isPending ? 'Đang cập nhật...' : 'Đổi Mật Khẩu'}
      </button_1.Button>
    </form>);
}
//# sourceMappingURL=SecurityTab.js.map