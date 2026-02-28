'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { authService } from '../api/auth.service';
import { LoginDTO } from '../types/auth.schema';
import { useAuthStore, UserSession } from '../stores/auth.store';
import { ApiError } from '@/shared/lib/error-parser';

export const useLogin = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation<UserSession, ApiError, LoginDTO>({
    mutationFn: authService.login,
    onSuccess: (user) => {
      setAuth(user);
      
      toast.success('Đăng nhập thành công');

      const callbackUrl = searchParams.get('callbackUrl');
      if (callbackUrl) {
        router.replace(callbackUrl);
        return;
      }

      // 3. Fallback theo Role quy chuẩn
      const targetRoute = user.role === 'STUDENT' ? '/student' : '/teacher';
      router.replace(targetRoute);
    },
    onError: (error) => {
      toast.error('Đăng nhập thất bại', { 
        description: error.message 
      });
    },
  });
};