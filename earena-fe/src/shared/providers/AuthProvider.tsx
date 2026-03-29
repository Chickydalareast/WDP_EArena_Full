'use client';

import { useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { authKeys } from '@/features/auth/api/auth.service';
import { toast } from 'sonner';
import { useSession } from '@/features/auth/hooks/useSession';
import { useSyncWallet } from '@/features/billing/hooks/useBillingFlows';
import dynamic from 'next/dynamic';
import { useNotificationStream } from '@/features/notifications/hooks/useNotificationStream';

const PUBLIC_ROUTES = ['/', '/login', '/register', '/forgot-password'];

const DynamicDepositModal = dynamic(
  () => import('@/features/billing/components/DepositModal').then((mod) => mod.DepositModal),
  { ssr: false }
);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  
  const { setAuth, clearAuth, setInitialized, updateBalance } = useAuthStore();
  const { user, isError, isSuccess, isFetched } = useSession();
  
  const { data: walletData, isSuccess: isWalletSuccess } = useSyncWallet();

  useEffect(() => {
    if (isSuccess && user) {
      setAuth(user);
    } else if (isError) {
      clearAuth();
    }
    
    if (isFetched) {
      setInitialized();
    }
  }, [isSuccess, isError, user, isFetched, setAuth, clearAuth, setInitialized]);

  useEffect(() => {
    if (isWalletSuccess && walletData !== undefined && typeof walletData.balance === 'number') {
      updateBalance(walletData.balance);
    }
  }, [isWalletSuccess, walletData, updateBalance]);

  const handleUnauthorized = useCallback(() => {
    clearAuth();
    
    queryClient.cancelQueries({ queryKey: authKeys.session() });
    queryClient.setQueryData(authKeys.session(), null);
    queryClient.removeQueries({
      predicate: (query) => query.queryKey[0] !== 'auth'
    });
    
    if (!PUBLIC_ROUTES.includes(pathname)) {
      toast.error('Phiên làm việc hết hạn. Vui lòng đăng nhập lại.');
      window.location.href = `/login?clear_session=true&callbackUrl=${encodeURIComponent(pathname)}`;
    }
  }, [pathname, clearAuth, queryClient]);

  useEffect(() => {
    window.addEventListener('core:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('core:unauthorized', handleUnauthorized);
  }, [handleUnauthorized]);

  useNotificationStream(isSuccess && !!user);

  return (
    <>
      {children}
      <DynamicDepositModal />
    </>
  );
}