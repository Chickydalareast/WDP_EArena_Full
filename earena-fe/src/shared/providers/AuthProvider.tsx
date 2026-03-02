'use client';

import { useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { authService, authKeys } from '@/features/auth/api/auth.service';
import { toast } from 'sonner';

const PUBLIC_ROUTES = ['/', '/login', '/register', '/forgot-password'];

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { setAuth, clearAuth } = useAuthStore();

  const { data: user, isError, isSuccess } = useQuery({
    queryKey: authKeys.session(),
    queryFn: authService.getProfile,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (isSuccess && user) {
      setAuth(user);
    }
    if (isError) {
      clearAuth();
    }
  }, [isSuccess, isError, user, setAuth, clearAuth]);

  const handleUnauthorized = useCallback(() => {
    clearAuth();
    
    queryClient.setQueryData(authKeys.session(), null);
    
    if (!PUBLIC_ROUTES.includes(pathname)) {
      toast.error('Phiên làm việc hết hạn. Vui lòng đăng nhập lại.');
      router.replace(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
    }
  }, [pathname, router, clearAuth, queryClient]);

  useEffect(() => {
    window.addEventListener('core:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('core:unauthorized', handleUnauthorized);
  }, [handleUnauthorized]);

  return <>{children}</>;
}