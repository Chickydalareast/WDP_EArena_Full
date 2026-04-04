'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = GeneralInfoTab;
const react_1 = require("react");
const react_hook_form_1 = require("react-hook-form");
const rhf_zod_resolver_1 = require("@/shared/lib/rhf-zod-resolver");
const profile_schema_1 = require("../../types/profile.schema");
const useUpdateProfile_1 = require("../../hooks/useUpdateProfile");
const auth_store_1 = require("@/features/auth/stores/auth.store");
const button_1 = require("@/shared/components/ui/button");
const input_1 = require("@/shared/components/ui/input");
const label_1 = require("@/shared/components/ui/label");
const sonner_1 = require("sonner");
function GeneralInfoTab() {
    const user = (0, auth_store_1.useAuthStore)((state) => state.user);
    const { mutate: updateProfile, isPending } = (0, useUpdateProfile_1.useUpdateProfile)();
    const [avatarFile, setAvatarFile] = (0, react_1.useState)(null);
    const [previewUrl, setPreviewUrl] = (0, react_1.useState)(user?.avatar || null);
    (0, react_1.useEffect)(() => {
        if (!avatarFile && user?.avatar) {
            setPreviewUrl(user.avatar);
        }
    }, [user?.avatar, avatarFile]);
    const { register, handleSubmit, formState: { errors, isDirty }, } = (0, react_hook_form_1.useForm)({
        resolver: (0, rhf_zod_resolver_1.rhfZodResolver)(profile_schema_1.ProfileSchema),
        values: {
            fullName: user?.fullName || '',
            phone: user?.phone || '',
            dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
        },
    });
    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024)
                return sonner_1.toast.error('Ảnh tối đa 5MB');
            setAvatarFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };
    const onSubmit = (data) => {
        if (!isDirty && !avatarFile)
            return;
        const cleanPayload = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== '' && v !== null));
        updateProfile({ payload: cleanPayload, avatarFile }, {
            onSuccess: () => {
                setAvatarFile(null);
                sonner_1.toast.success('Cập nhật hồ sơ thành công');
            }
        });
    };
    if (!user)
        return null;
    return (<form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center space-x-6 p-4 border border-border rounded-lg bg-card/50">
                {previewUrl ? (<img src={previewUrl} alt="Avatar" className="w-20 h-20 rounded-full object-cover shadow-sm border border-border"/>) : (<div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold text-xl border border-border">
                        {user.fullName?.charAt(0).toUpperCase() || 'U'}
                    </div>)}
                <div className="flex-1">
                    <label_1.Label htmlFor="avatar-upload" className="mb-2 block font-medium">Ảnh đại diện (Max: 5MB)</label_1.Label>
                    <input_1.Input id="avatar-upload" type="file" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} className="cursor-pointer" disabled={isPending}/>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label_1.Label htmlFor="fullName">Họ và Tên</label_1.Label>
                    <input_1.Input id="fullName" {...register('fullName')} disabled={isPending}/>
                    {errors.fullName && <p className="text-xs font-medium text-destructive">{errors.fullName.message}</p>}
                </div>

                <div className="space-y-2">
                    <label_1.Label htmlFor="phone">Số điện thoại</label_1.Label>
                    <input_1.Input id="phone" {...register('phone')} disabled={isPending}/>
                    {errors.phone && <p className="text-xs font-medium text-destructive">{errors.phone.message}</p>}
                </div>

                <div className="space-y-2 md:col-span-2">
                    <label_1.Label htmlFor="dateOfBirth">Ngày sinh</label_1.Label>
                    <input_1.Input id="dateOfBirth" type="date" {...register('dateOfBirth')} disabled={isPending}/>
                    {errors.dateOfBirth && <p className="text-xs font-medium text-destructive">{errors.dateOfBirth.message}</p>}
                </div>
            </div>

            <button_1.Button type="submit" disabled={isPending || (!isDirty && !avatarFile)} className="w-full md:w-auto">
                {isPending ? 'Đang xử lý...' : 'Lưu Thay Đổi'}
            </button_1.Button>
        </form>);
}
//# sourceMappingURL=GeneralInfoTab.js.map