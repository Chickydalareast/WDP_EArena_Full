'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { authService, authKeys } from '../api/auth.service';
import { useAuthStore, UserSession } from '../stores/auth.store';
import { ApiError } from '@/shared/lib/error-parser';

export const useGoogleAuth = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation<UserSession, ApiError, string>({
    mutationFn: (idToken: string) => authService.googleLogin({ idToken }),
    onSuccess: (user) => {
      setAuth(user);
      
      queryClient.setQueryData(authKeys.session(), user);
      
      toast.success('Đăng nhập Google thành công');

      const callbackUrl = searchParams.get('callbackUrl');
      if (callbackUrl) {
        router.replace(callbackUrl);
        return;
      }

      const targetRoute = user.role === 'STUDENT' ? '/student' : '/teacher';
      router.replace(targetRoute);
    },
    onError: (error) => {
      toast.error('Xác thực Google thất bại', { 
        description: error.message 
      });
    },
  });
};