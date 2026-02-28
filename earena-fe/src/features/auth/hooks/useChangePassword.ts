'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { authService, ChangePasswordDTO } from '../api/auth.service';
import { useLogout } from './useLogout';
import { ApiError } from '@/shared/lib/error-parser';

export const useChangePassword = () => {
  const { mutate: executeLogout } = useLogout();

  return useMutation<{ message: string }, ApiError, ChangePasswordDTO>({
    mutationFn: authService.changePassword,
    onSuccess: (data) => {
      toast.success('Đổi mật khẩu thành công', {
        description: 'Vui lòng đăng nhập lại với mật khẩu mới.',
      });

      // BẮT BUỘC: Clear state FE và đẩy về trang chủ vì BE đã hủy Cookie RT
      executeLogout();
    },
    onError: (error) => {
      toast.error('Lỗi đổi mật khẩu', {
        description: error.message,
      });
    },
  });
};