'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { toast } from 'sonner';

import { useAuthFlowStore } from '../stores/auth-flow.store';
import { useSendOtp, useVerifyOtp, useRegister } from '../hooks';
import { 
  registerEmailSchema, RegisterEmailDTO,
  verifyOtpSchema, VerifyOtpFormDTO,
  registerDetailsSchema, RegisterDetailsDTO 
} from '../types/auth.schema';

const EmailStep = () => {
  const { mutate: sendOtp, isPending } = useSendOtp();
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterEmailDTO>({
    resolver: zodResolver(registerEmailSchema),
  });

  return (
    <form onSubmit={handleSubmit((data) => sendOtp({ email: data.email, type: 'REGISTER' }))} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Nhập Email sinh viên / giáo viên</Label>
        <Input 
          id="email" type="email" placeholder="hvm@earena.edu.vn" 
          disabled={isPending} {...register('email')} 
          className={errors.email ? 'border-red-500' : ''} 
        />
        {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Đang gửi...' : 'Gửi mã xác nhận'}
      </Button>
    </form>
  );
};

const OtpStep = () => {
  const { email, resendAvailableAt, setStep } = useAuthFlowStore();
  const { mutate: verifyOtp, isPending } = useVerifyOtp();
  const { mutate: resendOtp, isPending: isResending } = useSendOtp();
  
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!resendAvailableAt) return;

    const calculateTimeLeft = () => {
      const remaining = Math.max(0, Math.floor((resendAvailableAt - Date.now()) / 1000));
      setTimeLeft(remaining);
      return remaining;
    };

    if (calculateTimeLeft() > 0) {
      const interval = setInterval(() => {
        if (calculateTimeLeft() <= 0) clearInterval(interval);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [resendAvailableAt]);

  const { register, handleSubmit, formState: { errors } } = useForm<VerifyOtpFormDTO>({
    resolver: zodResolver(verifyOtpSchema),
  });

  return (
    <form onSubmit={handleSubmit((data) => verifyOtp({ email, otp: data.otp, type: 'REGISTER' }))} className="space-y-4">
      <div className="text-center mb-4">
        <p className="text-sm text-gray-600">Mã xác nhận đã được gửi đến</p>
        <p className="font-semibold text-primary">{email}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="otp">Mã OTP (6 chữ số)</Label>
        <Input 
          id="otp" maxLength={6} placeholder="123456" 
          disabled={isPending} {...register('otp')} 
          className={`text-center tracking-widest text-lg ${errors.otp ? 'border-red-500' : ''}`} 
        />
        {errors.otp && <p className="text-sm text-red-500 text-center">{errors.otp.message}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Đang xác thực...' : 'Xác nhận OTP'}
      </Button>

      <div className="flex flex-col items-center gap-2 mt-4 text-sm">
        {timeLeft > 0 ? (
          <p className="text-gray-500">Gửi lại mã sau <span className="font-bold">{timeLeft}s</span></p>
        ) : (
          <Button 
            variant="link" type="button" onClick={() => resendOtp({ email, type: 'REGISTER' })}
            disabled={isResending} className="h-auto p-0"
          >
            {isResending ? 'Đang gửi lại...' : 'Chưa nhận được mã? Gửi lại'}
          </Button>
        )}
        <Button variant="ghost" type="button" onClick={() => setStep('INPUT_EMAIL')} className="text-xs text-gray-400">
          Sai địa chỉ email? Quay lại
        </Button>
      </div>
    </form>
  );
};

const DetailsStep = () => {
  const { email, ticket } = useAuthFlowStore();
  const { mutate: executeRegister, isPending } = useRegister();
  
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterDetailsDTO>({
    resolver: zodResolver(registerDetailsSchema),
  });

  const onSubmit = (data: RegisterDetailsDTO) => {
  if (!ticket) {
    toast.error('Dữ liệu xác thực không hợp lệ', {
      description: 'Không tìm thấy Ticket. Vui lòng quay lại bước 1.',
    });
    // Trả user về bước 1 nếu mất ticket
    useAuthFlowStore.getState().resetFlow(); 
    return; 
  }

  executeRegister({
    email,
    fullName: data.fullName,
    password: data.password,
    ticket: ticket,
  });
};

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Họ và Tên</Label>
        <Input id="fullName" disabled={isPending} {...register('fullName')} className={errors.fullName ? 'border-red-500' : ''} />
        {errors.fullName && <p className="text-sm text-red-500">{errors.fullName.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Mật khẩu mới</Label>
        <Input id="password" type="password" disabled={isPending} {...register('password')} className={errors.password ? 'border-red-500' : ''} />
        {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
        <Input id="confirmPassword" type="password" disabled={isPending} {...register('confirmPassword')} className={errors.confirmPassword ? 'border-red-500' : ''} />
        {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Đang tạo tài khoản...' : 'Hoàn tất Đăng ký'}
      </Button>
    </form>
  );
};

// ==========================================
// MAIN CONTROLLER COMPONENT
// ==========================================
export const RegisterScreen = () => {
  const step = useAuthFlowStore((state) => state.step);

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-100">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
          {step === 'INPUT_EMAIL' && 'Tạo Tài Khoản'}
          {step === 'VERIFY_OTP' && 'Xác Thực Email'}
          {step === 'INPUT_DETAILS' && 'Thiết Lập Mật Khẩu'}
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          {step === 'INPUT_EMAIL' && 'Bước 1/3: Hệ thống EArena Portal'}
          {step === 'VERIFY_OTP' && 'Bước 2/3: Xác minh danh tính'}
          {step === 'INPUT_DETAILS' && 'Bước 3/3: Hoàn tất hồ sơ'}
        </p>
      </div>

      {/* Render component dựa theo State */}
      {step === 'INPUT_EMAIL' && <EmailStep />}
      {step === 'VERIFY_OTP' && <OtpStep />}
      {step === 'INPUT_DETAILS' && <DetailsStep />}
    </div>
  );
};