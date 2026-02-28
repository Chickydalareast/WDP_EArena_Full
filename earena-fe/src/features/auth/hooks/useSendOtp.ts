'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { authService, SendOtpDTO } from '../api/auth.service';
import { useAuthFlowStore } from '../stores/auth-flow.store';
import { ApiError } from '@/shared/lib/error-parser'; 

export const useSendOtp = () => {
  const { setStep, setEmail, setResendAvailableAt } = useAuthFlowStore();

  return useMutation<void, ApiError, SendOtpDTO>({ 
    mutationFn: authService.sendOtp,
    onSuccess: (_, variables) => {
      setEmail(variables.email);
      setResendAvailableAt(Date.now() + 60 * 1000);
      setStep('VERIFY_OTP');
      
      toast.success('Đã gửi mã xác nhận', {
        description: `Vui lòng kiểm tra hộp thư ${variables.email}`,
      });
    },
    onError: (error) => {
      toast.error('Gửi mã thất bại', { 
        description: error.message 
      });
    },
  });
};