'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ProfileSchema, ProfileFormValues } from '../../types/profile.schema';
import { useUpdateProfile } from '../../hooks/useUpdateProfile';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { toast } from 'sonner';

export default function GeneralInfoTab() {
    const user = useAuthStore((state) => state.user);
    const { mutate: updateProfile, isPending } = useUpdateProfile();

    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(user?.avatar || null);

    useEffect(() => {
        if (!avatarFile && user?.avatar) {
            setPreviewUrl(user.avatar);
        }
    }, [user?.avatar, avatarFile]);

    const {
        register,
        handleSubmit,
        formState: { errors, isDirty },
    } = useForm<ProfileFormValues>({
        resolver: zodResolver(ProfileSchema),
        values: {
            fullName: user?.fullName || '',
            phone: user?.phone || '',
            dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
        },
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) return toast.error('Ảnh tối đa 5MB');
            setAvatarFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const onSubmit = (data: ProfileFormValues) => {
        if (!isDirty && !avatarFile) return;

        const cleanPayload = Object.fromEntries(
            Object.entries(data).filter(([_, v]) => v !== '' && v !== null)
        );

        updateProfile(
            { payload: cleanPayload, avatarFile },
            {
                onSuccess: () => {
                    setAvatarFile(null); 
                    toast.success('Cập nhật hồ sơ thành công');
                }
            }
        );
    };

    if (!user) return null; 

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center space-x-6 p-4 border border-border rounded-lg bg-card/50">
                {previewUrl ? (
                    <img src={previewUrl} alt="Avatar" className="w-20 h-20 rounded-full object-cover shadow-sm border border-border" />
                ) : (
                    <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold text-xl border border-border">
                        {user.fullName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                )}
                <div className="flex-1">
                    <Label htmlFor="avatar-upload" className="mb-2 block font-medium">Ảnh đại diện (Max: 5MB)</Label>
                    <Input
                        id="avatar-upload"
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        onChange={handleFileChange}
                        className="cursor-pointer"
                        disabled={isPending}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="fullName">Họ và Tên</Label>
                    <Input id="fullName" {...register('fullName')} disabled={isPending} />
                    {errors.fullName && <p className="text-xs font-medium text-destructive">{errors.fullName.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="phone">Số điện thoại</Label>
                    <Input id="phone" {...register('phone')} disabled={isPending} />
                    {errors.phone && <p className="text-xs font-medium text-destructive">{errors.phone.message}</p>}
                </div>

                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="dateOfBirth">Ngày sinh</Label>
                    <Input id="dateOfBirth" type="date" {...register('dateOfBirth')} disabled={isPending} />
                    {errors.dateOfBirth && <p className="text-xs font-medium text-destructive">{errors.dateOfBirth.message}</p>}
                </div>
            </div>

            <Button type="submit" disabled={isPending || (!isDirty && !avatarFile)} className="w-full md:w-auto">
                {isPending ? 'Đang xử lý...' : 'Lưu Thay Đổi'}
            </Button>
        </form>
    );
}