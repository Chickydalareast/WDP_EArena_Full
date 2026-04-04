'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { rhfZodResolver as zodResolver } from '@/shared/lib/rhf-zod-resolver';
import { ProfileSchema, ProfileFormValues } from '../../types/profile.schema';
import { useUpdateProfile } from '../../hooks/useUpdateProfile';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { toast } from 'sonner';
import { UserCircle, CheckCircle2, Edit2 } from 'lucide-react';

export default function PersonalInfoSection() {
    const user = useAuthStore((state) => state.user);
    const { mutate: updateProfile, isPending } = useUpdateProfile();
    const [isEditing, setIsEditing] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isDirty },
    } = useForm<ProfileFormValues>({
        resolver: zodResolver(ProfileSchema),
        values: {
            fullName: user?.fullName || '',
            phone: user?.phone || '',
            dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
        },
    });

    const handleCancel = () => {
        reset(); 
        setIsEditing(false);
    };

    const onSubmit = (data: ProfileFormValues) => {
        if (!isDirty) {
            setIsEditing(false);
            return;
        }

        const cleanPayload = Object.fromEntries(
            Object.entries(data).filter(([_, v]) => v !== '' && v !== null)
        );

        updateProfile(
            { payload: cleanPayload, avatarFile: null }, 
            {
                onSuccess: () => {
                    toast.success('Cập nhật hồ sơ thành công');
                    setIsEditing(false);
                }
            }
        );
    };

    if (!user) return null;

    const inputStyles = isEditing 
        ? "form-input rounded-lg border-primary/20 bg-slate-50 dark:bg-slate-900 focus:border-primary focus:ring-primary w-full px-4 py-2 text-slate-900 dark:text-slate-100 transition-all"
        : "form-input rounded-lg border-transparent bg-transparent focus:border-transparent focus:ring-0 w-full px-0 py-0 text-slate-900 dark:text-slate-100 font-medium cursor-default";

    return (
        <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-primary/5 overflow-hidden transition-all duration-300">
            <div className="px-6 py-4 border-b border-primary/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <UserCircle className="text-primary" size={24} />
                    <h3 className="font-bold text-lg">Thông tin cá nhân</h3>
                </div>
                {!isEditing && (
                    <button 
                        onClick={() => setIsEditing(true)}
                        className="text-primary text-sm font-bold flex items-center gap-1 hover:underline transition-all"
                    >
                        <Edit2 size={16} />
                        Chỉnh sửa
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-slate-500">Họ và tên</label>
                        <input 
                            type="text" 
                            {...register('fullName')} 
                            disabled={!isEditing || isPending}
                            className={inputStyles}
                        />
                        {errors.fullName && <p className="text-xs font-medium text-red-500">{errors.fullName.message}</p>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-slate-500">Ngày sinh</label>
                        <input 
                            type="date" 
                            {...register('dateOfBirth')} 
                            disabled={!isEditing || isPending}
                            className={inputStyles}
                        />
                        {errors.dateOfBirth && <p className="text-xs font-medium text-red-500">{errors.dateOfBirth.message}</p>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-slate-500">Số điện thoại</label>
                        <input 
                            type="text" 
                            {...register('phone')} 
                            disabled={!isEditing || isPending}
                            className={inputStyles}
                        />
                        {errors.phone && <p className="text-xs font-medium text-red-500">{errors.phone.message}</p>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-slate-500">Email</label>
                        <div className="relative flex items-center">
                            <input 
                                type="email" 
                                value={user.email || 'Chưa cập nhật'} 
                                disabled
                                className="form-input rounded-lg border-transparent bg-transparent focus:border-transparent focus:ring-0 w-full px-0 py-0 text-slate-900 dark:text-slate-100 font-medium cursor-not-allowed pr-28"
                            />
                            <div className="absolute right-0 flex items-center gap-1 text-green-500 text-xs font-medium">
                                <CheckCircle2 size={16} />
                                Đã xác minh
                            </div>
                        </div>
                    </div>
                </div>

                {isEditing && (
                    <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 animate-in slide-in-from-bottom-2 fade-in duration-300">
                        <button 
                            type="button" 
                            onClick={handleCancel}
                            disabled={isPending}
                            className="px-6 py-2 rounded-xl text-slate-500 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        >
                            Hủy bỏ
                        </button>
                        <button 
                            type="submit" 
                            disabled={isPending}
                            className="px-8 py-2 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all disabled:opacity-50"
                        >
                            {isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                    </div>
                )}
            </form>
        </section>
    );
}