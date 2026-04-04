'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { rhfZodResolver as zodResolver } from '@/shared/lib/rhf-zod-resolver';
import { ProfileSchema, ProfileFormValues } from '../types/profile.schema';
import { useUpdateProfile } from '../hooks/useUpdateProfile';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { toast } from 'sonner';

export default function ProfileForm() {
  const user = useAuthStore((state) => state.user);
  const { mutate: updateProfile, isPending } = useUpdateProfile();
  
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(user?.avatar || null);

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

  useEffect(() => {
    if (!avatarFile && user?.avatar) {
      setPreviewUrl(user.avatar);
    }
  }, [user?.avatar, avatarFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        return toast.error('Kích thước ảnh vượt quá giới hạn (Tối đa 5MB)');
      }
      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const onSubmit = (data: ProfileFormValues) => {
    if (!isDirty && !avatarFile) return;
    
    updateProfile(
      { payload: data, avatarFile },
      {
        onSuccess: () => {
          setAvatarFile(null);
        }
      }
    );
  };

  if (!user) return null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-md">
      <div className="flex items-center space-x-4">
        {previewUrl ? (
          <img src={previewUrl} alt="Avatar" className="w-16 h-16 rounded-full object-cover border border-border" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground border border-border text-xl font-semibold">
            {user.fullName?.charAt(0).toUpperCase() || 'U'}
          </div>
        )}
        <div>
          <Label htmlFor="avatar-upload">Đổi ảnh đại diện</Label>
          <p className="text-xs text-muted-foreground mb-2 mt-1">Tối đa 5MB (JPEG, PNG, WEBP)</p>
          <Input 
            id="avatar-upload" 
            type="file" 
            accept="image/png, image/jpeg, image/webp" 
            onChange={handleFileChange} 
            className="cursor-pointer"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="fullName">Họ và Tên</Label>
        <Input id="fullName" placeholder="Nhập họ và tên..." {...register('fullName')} />
        {errors.fullName && <p className="text-sm font-medium text-destructive">{errors.fullName.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Số điện thoại</Label>
        <Input id="phone" placeholder="Nhập số điện thoại..." {...register('phone')} />
        {errors.phone && <p className="text-sm font-medium text-destructive">{errors.phone.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="dateOfBirth">Ngày sinh</Label>
        <Input id="dateOfBirth" type="date" {...register('dateOfBirth')} />
        {errors.dateOfBirth && <p className="text-sm font-medium text-destructive">{errors.dateOfBirth.message}</p>}
      </div>

      <Button type="submit" disabled={isPending || (!isDirty && !avatarFile)} className="w-full sm:w-auto">
        {isPending ? 'Đang cập nhật...' : 'Lưu Thay Đổi'}
      </Button>
    </form>
  );
}