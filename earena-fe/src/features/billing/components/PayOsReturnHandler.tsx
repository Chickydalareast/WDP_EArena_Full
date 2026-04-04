'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { billingService } from '../api/billing.service';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { courseQueryKeys } from '@/features/courses/api/course-keys';
import { WALLET_TRANSACTIONS_KEY } from '../hooks/useBillingFlows';
import { toast } from 'sonner';
import { parseApiError } from '@/shared/lib/error-parser';

/**
 * PayOS redirect về returnUrl kèm query: code, status, orderCode, cancel...
 * Webhook thường không tới localhost — cần gọi confirm-return để cộng ví.
 */
export function PayOsReturnHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const updateBalance = useAuthStore((s) => s.updateBalance);
  const ranForKey = useRef<string | null>(null);

  useEffect(() => {
    const orderCodeRaw = searchParams.get('orderCode');
    if (!orderCodeRaw) return;

    const code = searchParams.get('code');
    const status = searchParams.get('status')?.toUpperCase() ?? '';
    const cancel = searchParams.get('cancel');

    const cleanUrl = () => {
      router.replace(pathname, { scroll: false });
    };

    if (cancel === 'true') {
      toast.info('Bạn đã hủy thanh toán.');
      cleanUrl();
      return;
    }

    if (code !== '00' || status !== 'PAID') {
      cleanUrl();
      return;
    }

    const orderCode = Number(orderCodeRaw);
    if (!Number.isFinite(orderCode) || orderCode < 1) {
      cleanUrl();
      return;
    }

    const dedupeKey = `${orderCode}`;
    if (ranForKey.current === dedupeKey) return;
    ranForKey.current = dedupeKey;

    billingService
      .confirmPayOsReturn(orderCode)
      .then((res) => {
        updateBalance(res.balance);
        queryClient.invalidateQueries({ queryKey: courseQueryKeys.walletBalance() });
        queryClient.invalidateQueries({ queryKey: WALLET_TRANSACTIONS_KEY });
        toast.success('Nạp tiền thành công!', {
          description: `Số dư ví: ${res.balance.toLocaleString('vi-VN')}đ`,
        });
      })
      .catch((err) => {
        ranForKey.current = null;
        const parsed = parseApiError(err);
        toast.error('Không thể xác nhận nạp tiền', { description: parsed.message });
      })
      .finally(() => {
        cleanUrl();
      });
  }, [searchParams, router, pathname, queryClient, updateBalance]);

  return null;
}
