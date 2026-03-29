'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { authKeys, authService } from '../api/auth.service';
import { ROUTES } from '@/config/routes';
import { useAuthStore } from '../stores/auth.store';

export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return useMutation({
    mutationFn: authService.logout,
    onSettled: () => {
      clearAuth();

      queryClient.cancelQueries({ queryKey: authKeys.session() });
      queryClient.setQueryData(authKeys.session(), null);
      queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== 'auth' });

      toast.success('Đã đăng xuất an toàn');
      router.replace(ROUTES.AUTH.LOGIN);
    },
  });
};