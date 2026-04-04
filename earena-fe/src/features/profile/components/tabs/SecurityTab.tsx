'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { rhfZodResolver as zodResolver } from '@/shared/lib/rhf-zod-resolver';
import { useChangePassword } from '@/features/auth/hooks/useChangePassword';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { toast } from 'sonner';

const SecuritySchema = z.object({
  oldPassword: z.string().min(6, 'Mật khẩu cũ phải có ít nhất 6 ký tự'),
  newPassword: z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự'),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

type SecurityFormValues = z.infer<typeof SecuritySchema>;

export default function SecurityTab() {
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
        }
      }
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <Label htmlFor="oldPassword">Mật khẩu hiện tại</Label>
        <Input id="oldPassword" type="password" placeholder="••••••••" {...register('oldPassword')} disabled={isPending} />
        {errors.oldPassword && <p className="text-xs font-medium text-destructive">{errors.oldPassword.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="newPassword">Mật khẩu mới</Label>
        <Input id="newPassword" type="password" placeholder="••••••••" {...register('newPassword')} disabled={isPending} />
        {errors.newPassword && <p className="text-xs font-medium text-destructive">{errors.newPassword.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
        <Input id="confirmPassword" type="password" placeholder="••••••••" {...register('confirmPassword')} disabled={isPending} />
        {errors.confirmPassword && <p className="text-xs font-medium text-destructive">{errors.confirmPassword.message}</p>}
      </div>

      <Button type="submit" variant="destructive" disabled={isPending} className="w-full md:w-auto">
        {isPending ? 'Đang cập nhật...' : 'Đổi Mật Khẩu'}
      </Button>
    </form>
  );
}