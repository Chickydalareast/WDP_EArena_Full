'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { authService } from '../api/auth.service';
import { useAuthStore } from '../stores/auth.store';

export const useLogout = () => {
  const router = useRouter();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const queryClient = useQueryClient();

  const executeLocalCleanup = () => {
    clearAuth();
    queryClient.clear();
    router.replace('/');
  };

  return useMutation({
    mutationFn: authService.logout,
    onMutate: () => {
      executeLocalCleanup();
      toast.success('Đã đăng xuất thành công');
    },
    onError: (error) => {
      console.error('[Auth Guard] Logout network error, ignored safely:', error);
    }
  });
};