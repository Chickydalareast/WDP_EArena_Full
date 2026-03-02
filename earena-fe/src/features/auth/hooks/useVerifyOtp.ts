// src/features/auth/hooks/useVerifyOtp.ts
'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { authService, VerifyOtpDTO } from '../api/auth.service';
import { useAuthFlowStore } from '../stores/auth-flow.store';
import { ApiError } from '@/shared/lib/error-parser';

export const useVerifyOtp = () => {
  const { setTicket, setStep, resetFlow } = useAuthFlowStore();

  return useMutation<{ ticket: string }, ApiError, VerifyOtpDTO>({
    mutationFn: authService.verifyOtp,
    onSuccess: (data) => {
      // Interceptor đã xử lý, data.ticket luôn tồn tại nếu API trả về 200 OK
      if (!data.ticket) {
        toast.error('Lỗi kiến trúc', { description: 'Server không trả về Ticket xác thực.' });
        return;
      }

      setTicket(data.ticket);
      setStep('INPUT_DETAILS');
    },
    onError: (error) => {
      // Check mã lỗi chuẩn từ Error Parser
      const isExceeded = error.code === 'OTP_ATTEMPTS_EXCEEDED' || error.statusCode === 429;

      if (isExceeded) {
        toast.error('Khóa bảo mật', {
          description: 'Bạn đã nhập sai quá 5 lần. Vui lòng yêu cầu gửi lại mã mới.'
        });
        resetFlow(); 
      } else {
        toast.error('Xác thực thất bại', {
          description: error.message 
        });
      }
    },
  });
};