'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { authService, ResetPasswordDTO } from '../api/auth.service';
import { useAuthFlowStore } from '../stores/auth-flow.store';
import { ApiError } from '@/shared/lib/error-parser';

export const useResetPassword = () => {
  const router = useRouter();
  const resetFlow = useAuthFlowStore((state) => state.resetFlow);

  return useMutation<{ message: string }, ApiError, ResetPasswordDTO>({
    mutationFn: authService.resetPassword,
    onSuccess: (data) => {
      // Thành công -> Xóa trạng thái ticket tạm thời
      resetFlow();
      
      toast.success('Thành công', {
        description: data.message || 'Mật khẩu đã được đặt lại.',
      });

      // API yêu cầu không auto-login, điều hướng về trang đăng nhập
      router.replace('/login');
    },
    onError: (error) => {
      // Vé hết hạn/sai (HTTP 400)
      const isTicketInvalid = error.statusCode === 400 || error.code === 'INVALID_TICKET';

      if (isTicketInvalid) {
        toast.error('Phiên làm việc hết hạn', {
          description: 'Vé xác thực đã hết hạn hoặc không hợp lệ. Vui lòng thử lại.',
        });
        resetFlow();
      } else {
        toast.error('Thất bại', {
          description: error.message,
        });
      }
    },
  });
};