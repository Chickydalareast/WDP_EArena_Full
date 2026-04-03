'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { authService, authKeys } from '../api/auth.service';
import { LoginDTO } from '../types/auth.schema';
import { UserSession } from '../stores/auth.store';
import { ApiError } from '@/shared/lib/error-parser';
import { resolvePostAuthRoute } from '../lib/post-auth-redirect';

export const useLogin = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  return useMutation<UserSession, ApiError, LoginDTO>({
    mutationFn: authService.login,
    onSuccess: (user) => {
      queryClient.setQueryData(authKeys.session(), user);
      
      toast.success('Đăng nhập thành công');

      const callbackUrl = searchParams.get('callbackUrl');
      router.replace(resolvePostAuthRoute(user, callbackUrl));
    },
    onError: (error) => {
      toast.error('Đăng nhập thất bại', { 
        description: error.message 
      });
    },
  });
};