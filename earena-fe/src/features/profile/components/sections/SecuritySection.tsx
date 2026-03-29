// src/features/profile/components/sections/SecuritySection.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useChangePassword } from '@/features/auth/hooks/useChangePassword';
import { toast } from 'sonner';
import { ShieldCheck, Key, History } from 'lucide-react';

const SecuritySchema = z.object({
    oldPassword: z.string().min(6, 'Mật khẩu cũ phải có ít nhất 6 ký tự'),
    newPassword: z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự'),
    confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
});

type SecurityFormValues = z.infer<typeof SecuritySchema>;

export default function SecuritySection() {
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const { mutate: changePassword, isPending } = useChangePassword();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<SecurityFormValues>({
        resolver: zodResolver(SecuritySchema),
    });

    const onSubmit = (data: SecurityFormValues) => {
        changePassword(
            {
                oldPassword: data.oldPassword,
                newPassword: data.newPassword,
            },
            {
                onSuccess: () => {
                    toast.success('Đổi mật khẩu thành công!');
                    reset();
                    setIsChangingPassword(false); // Đóng form sau khi thành công
                }
            }
        );
    };

    const handleCancel = () => {
        reset();
        setIsChangingPassword(false); // Đóng form
    };

    return (
        <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-primary/5 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-primary/5 flex items-center gap-2">
                <ShieldCheck className="text-primary" size={24} />
                <h3 className="font-bold text-lg">Bảo mật & Đăng nhập</h3>
            </div>

            <div className="p-6 space-y-4">
                {/* Dòng trạng thái mặc định */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50 transition-all">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-slate-500">Phương thức đăng nhập</p>
                        <p className="font-semibold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                            <Key className="text-slate-400" size={16} />
                            Mật khẩu
                        </p>
                    </div>
                    
                    {!isChangingPassword && (
                        <button 
                            onClick={() => setIsChangingPassword(true)}
                            className="px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-primary/20 text-primary text-sm font-bold hover:bg-primary/5 transition-colors"
                        >
                            Đổi mật khẩu
                        </button>
                    )}
                </div>

                {/* Form đổi mật khẩu ẩn/hiện */}
                {isChangingPassword && (
                    <form onSubmit={handleSubmit(onSubmit)} className="mt-4 p-5 rounded-lg border border-primary/10 bg-white dark:bg-slate-800 animate-in fade-in slide-in-from-top-4 duration-300">
                        <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Cập nhật mật khẩu mới</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-sm font-medium text-slate-500">Mật khẩu hiện tại</label>
                                <input 
                                    type="password" 
                                    placeholder="••••••••" 
                                    {...register('oldPassword')} 
                                    disabled={isPending} 
                                    className="form-input rounded-lg border-primary/20 bg-slate-50 dark:bg-slate-900 focus:border-primary focus:ring-primary w-full px-4 py-2 text-slate-900 dark:text-slate-100"
                                />
                                {errors.oldPassword && <p className="text-xs font-medium text-red-500">{errors.oldPassword.message}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-500">Mật khẩu mới</label>
                                <input 
                                    type="password" 
                                    placeholder="••••••••" 
                                    {...register('newPassword')} 
                                    disabled={isPending} 
                                    className="form-input rounded-lg border-primary/20 bg-slate-50 dark:bg-slate-900 focus:border-primary focus:ring-primary w-full px-4 py-2 text-slate-900 dark:text-slate-100"
                                />
                                {errors.newPassword && <p className="text-xs font-medium text-red-500">{errors.newPassword.message}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-500">Xác nhận mật khẩu mới</label>
                                <input 
                                    type="password" 
                                    placeholder="••••••••" 
                                    {...register('confirmPassword')} 
                                    disabled={isPending} 
                                    className="form-input rounded-lg border-primary/20 bg-slate-50 dark:bg-slate-900 focus:border-primary focus:ring-primary w-full px-4 py-2 text-slate-900 dark:text-slate-100"
                                />
                                {errors.confirmPassword && <p className="text-xs font-medium text-red-500">{errors.confirmPassword.message}</p>}
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <button 
                                type="button" 
                                onClick={handleCancel}
                                disabled={isPending}
                                className="px-5 py-2 rounded-xl text-slate-500 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            >
                                Hủy
                            </button>
                            <button 
                                type="submit" 
                                disabled={isPending}
                                className="px-6 py-2 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all disabled:opacity-50"
                            >
                                {isPending ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
                            </button>
                        </div>
                    </form>
                )}

                {/* Tracking Log */}
                <div className="flex items-center gap-3 px-4 pt-2 text-sm text-slate-500">
                    <History size={16} />
                    Lần đăng nhập cuối: <span className="text-slate-900 dark:text-slate-100 font-medium ml-1">Phiên hiện tại</span>
                </div>
            </div>
        </section>
    );
}