'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ProfileForm;
const react_1 = require("react");
const react_hook_form_1 = require("react-hook-form");
const rhf_zod_resolver_1 = require("@/shared/lib/rhf-zod-resolver");
const profile_schema_1 = require("../types/profile.schema");
const useUpdateProfile_1 = require("../hooks/useUpdateProfile");
const auth_store_1 = require("@/features/auth/stores/auth.store");
const button_1 = require("@/shared/components/ui/button");
const input_1 = require("@/shared/components/ui/input");
const label_1 = require("@/shared/components/ui/label");
const sonner_1 = require("sonner");
function ProfileForm() {
    const user = (0, auth_store_1.useAuthStore)((state) => state.user);
    const { mutate: updateProfile, isPending } = (0, useUpdateProfile_1.useUpdateProfile)();
    const [avatarFile, setAvatarFile] = (0, react_1.useState)(null);
    const [previewUrl, setPreviewUrl] = (0, react_1.useState)(user?.avatar || null);
    const { register, handleSubmit, formState: { errors, isDirty }, } = (0, react_hook_form_1.useForm)({
        resolver: (0, rhf_zod_resolver_1.rhfZodResolver)(profile_schema_1.ProfileSchema),
        values: {
            fullName: user?.fullName || '',
            phone: user?.phone || '',
            dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
        },
    });
    (0, react_1.useEffect)(() => {
        if (!avatarFile && user?.avatar) {
            setPreviewUrl(user.avatar);
        }
    }, [user?.avatar, avatarFile]);
    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                return sonner_1.toast.error('Kích thước ảnh vượt quá giới hạn (Tối đa 5MB)');
            }
            setAvatarFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };
    const onSubmit = (data) => {
        if (!isDirty && !avatarFile)
            return;
        updateProfile({ payload: data, avatarFile }, {
            onSuccess: () => {
                setAvatarFile(null);
            }
        });
    };
    if (!user)
        return null;
    return (<form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-md">
      <div className="flex items-center space-x-4">
        {previewUrl ? (<img src={previewUrl} alt="Avatar" className="w-16 h-16 rounded-full object-cover border border-border"/>) : (<div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground border border-border text-xl font-semibold">
            {user.fullName?.charAt(0).toUpperCase() || 'U'}
          </div>)}
        <div>
          <label_1.Label htmlFor="avatar-upload">Đổi ảnh đại diện</label_1.Label>
          <p className="text-xs text-muted-foreground mb-2 mt-1">Tối đa 5MB (JPEG, PNG, WEBP)</p>
          <input_1.Input id="avatar-upload" type="file" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} className="cursor-pointer"/>
        </div>
      </div>

      <div className="space-y-2">
        <label_1.Label htmlFor="fullName">Họ và Tên</label_1.Label>
        <input_1.Input id="fullName" placeholder="Nhập họ và tên..." {...register('fullName')}/>
        {errors.fullName && <p className="text-sm font-medium text-destructive">{errors.fullName.message}</p>}
      </div>

      <div className="space-y-2">
        <label_1.Label htmlFor="phone">Số điện thoại</label_1.Label>
        <input_1.Input id="phone" placeholder="Nhập số điện thoại..." {...register('phone')}/>
        {errors.phone && <p className="text-sm font-medium text-destructive">{errors.phone.message}</p>}
      </div>

      <div className="space-y-2">
        <label_1.Label htmlFor="dateOfBirth">Ngày sinh</label_1.Label>
        <input_1.Input id="dateOfBirth" type="date" {...register('dateOfBirth')}/>
        {errors.dateOfBirth && <p className="text-sm font-medium text-destructive">{errors.dateOfBirth.message}</p>}
      </div>

      <button_1.Button type="submit" disabled={isPending || (!isDirty && !avatarFile)} className="w-full sm:w-auto">
        {isPending ? 'Đang cập nhật...' : 'Lưu Thay Đổi'}
      </button_1.Button>
    </form>);
}
//# sourceMappingURL=ProfileForm.js.map