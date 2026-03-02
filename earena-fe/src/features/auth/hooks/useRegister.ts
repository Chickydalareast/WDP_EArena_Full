'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { authService, RegisterDTO } from '../api/auth.service';
import { useAuthFlowStore } from '../stores/auth-flow.store';
import { useAuthStore, UserSession } from '../stores/auth.store';
import { ApiError } from '@/shared/lib/error-parser';

export const useRegister = () => {
  const router = useRouter();
  const resetFlow = useAuthFlowStore((state) => state.resetFlow);
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation<UserSession, ApiError, RegisterDTO>({
    mutationFn: authService.register,
    onSuccess: (user) => {
      setAuth(user);
      resetFlow();

      toast.success('Đăng ký thành công', {
        description: 'Đang khởi tạo không gian làm việc...',
      });

      const targetRoute = user.role === 'STUDENT' ? '/student' : '/teacher';
      router.replace(targetRoute);
    },
    onError: (error) => {
      const isTicketInvalid = error.statusCode === 400 || error.code === 'INVALID_TICKET';

      if (isTicketInvalid) {
        toast.error('Phiên đăng ký hết hạn', {
          description: 'Phiên làm việc đã quá 15 phút hoặc không hợp lệ. Vui lòng bắt đầu lại.',
        });
        resetFlow();
      } else {
        toast.error('Đăng ký thất bại', {
          description: error.message,
        });
      }
    },
  });
};