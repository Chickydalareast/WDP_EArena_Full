'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { toast } from 'sonner';

import { useAuthFlowStore } from '../stores/auth-flow.store';
import { useSendOtp, useVerifyOtp } from '../hooks';
import { useResetPassword } from '../hooks/useResetPassword'; // Hook vừa tạo ở bước trước

// (Giữ nguyên các Schema của bạn, ở đây tôi dùng tạm type any để code ngắn gọn. Bạn hãy bọc Zod Schema tương tự RegisterScreen)

const EmailStep = () => {
  const { mutate: sendOtp, isPending } = useSendOtp();
  const { register, handleSubmit } = useForm(); // NÊN add resolver

  return (
    <form onSubmit={handleSubmit((data: any) => sendOtp({ email: data.email, type: 'FORGOT_PASSWORD' }))} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email đã đăng ký</Label>
        <Input id="email" type="email" placeholder="hvm@earena.edu.vn" disabled={isPending} {...register('email')} />
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Đang kiểm tra...' : 'Gửi mã khôi phục'}
      </Button>
    </form>
  );
};

// ... (Bạn có thể Copy nguyên cái OtpStep từ RegisterScreen sang đây, chỉ cần sửa chữ type: 'REGISTER' thành type: 'FORGOT_PASSWORD')
// Dưới đây là đoạn code tôi thu gọn để làm ví dụ:
const OtpStep = () => {
  const { email } = useAuthFlowStore();
  const { mutate: verifyOtp, isPending } = useVerifyOtp();
  const { register, handleSubmit } = useForm();
  
  return (
    <form onSubmit={handleSubmit((data: any) => verifyOtp({ email, otp: data.otp, type: 'FORGOT_PASSWORD' }))} className="space-y-4">
      <Label>Nhập OTP gửi về {email}</Label>
      <Input maxLength={6} disabled={isPending} {...register('otp')} className="text-center tracking-widest text-lg" />
      <Button type="submit" className="w-full" disabled={isPending}>Xác nhận OTP</Button>
    </form>
  );
};

const ResetPassStep = () => {
  const { email, ticket } = useAuthFlowStore();
  const { mutate: executeReset, isPending } = useResetPassword();
  const { register, handleSubmit } = useForm();

  const onSubmit = (data: any) => {
    if (!ticket) return toast.error('Lỗi phiên làm việc');
    executeReset({ email, newPassword: data.newPassword, ticket });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>Mật khẩu mới</Label>
        <Input type="password" disabled={isPending} {...register('newPassword')} />
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Đang đổi mật khẩu...' : 'Xác nhận đổi mật khẩu'}
      </Button>
    </form>
  );
};

export const ForgotPasswordScreen = () => {
  const step = useAuthFlowStore((state) => state.step);

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-100 dark:bg-gray-900 dark:border-gray-800">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Khôi phục mật khẩu</h2>
      </div>
      {step === 'INPUT_EMAIL' && <EmailStep />}
      {step === 'VERIFY_OTP' && <OtpStep />}
      {step === 'INPUT_DETAILS' && <ResetPassStep />}
    </div>
  );
};