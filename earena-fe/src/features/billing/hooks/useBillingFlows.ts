import { useMutation, useQuery, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { billingService, CreatePaymentLinkResponse } from '../api/billing.service';
import { useBillingUIStore } from '../stores/billing-ui.store';
import { useTransactionConfirmStore } from '../stores/transaction-confirm.store';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { courseQueryKeys } from '@/features/courses/api/course-keys';
import { CourseBasic } from '@/features/courses/types/course.schema';
import { ROUTES } from '@/config/routes';
import { parseApiError } from '@/shared/lib/error-parser';
import { toast } from 'sonner';
import { useState } from 'react';

export const WALLET_TRANSACTIONS_KEY = ['wallets', 'transactions'];

export const useCheckoutFlow = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const openDepositModal = useBillingUIStore((state) => state.openDepositModal);
  const openConfirm = useTransactionConfirmStore((state) => state.openConfirm);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const mutation = useMutation({
    mutationFn: (courseId: string) => billingService.checkoutCourse(courseId),
    onSuccess: (data, courseId) => {
      toast.success('Thành công!', { description: data.message });

      queryClient.invalidateQueries({ queryKey: courseQueryKeys.walletBalance() });
      queryClient.invalidateQueries({ queryKey: WALLET_TRANSACTIONS_KEY });
      queryClient.invalidateQueries({ queryKey: courseQueryKeys.publicDetails() });
      queryClient.invalidateQueries({ queryKey: courseQueryKeys.studyTrees() });

      router.push(ROUTES.STUDENT.STUDY_ROOM(courseId));
    },
    onError: (error, courseId) => {
      const parsed = parseApiError(error);

      if (parsed.statusCode === 409) {
        toast.success('Bạn đã sở hữu khóa học này!', {
          description: 'Đang chuyển hướng vào phòng học...'
        });
        router.push(ROUTES.STUDENT.STUDY_ROOM(courseId));
        return;
      }

      if (parsed.statusCode === 400 && parsed.message.toLowerCase().includes('số dư')) {
        toast.error('Giao dịch bị từ chối', { description: parsed.message });
        openDepositModal();
        return;
      }

      toast.error('Giao dịch thất bại', { description: parsed.message });
    }
  });

  const handleCheckout = async (course: CourseBasic) => {
    if (!isAuthenticated) {
      toast.info('Vui lòng đăng nhập để tiếp tục.');
      router.push(`${ROUTES.AUTH.LOGIN}?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    const finalPrice = course.discountPrice ?? course.price;

    if (finalPrice > 0) {
      const freshWallet = await queryClient.fetchQuery({
        queryKey: courseQueryKeys.walletBalance(),
        queryFn: billingService.getMyWallet,
      });
      const currentBalance = freshWallet?.balance ?? useAuthStore.getState().user?.balance ?? 0;
      useAuthStore.getState().updateBalance(currentBalance);

      if (currentBalance < finalPrice) {
        const missingAmount = finalPrice - currentBalance;
        toast.warning('Số dư ví không đủ.', { description: 'Vui lòng nạp thêm tiền để thanh toán.' });
        openDepositModal(missingAmount);
        return;
      }

      openConfirm({
        title: 'Thanh toán khóa học',
        description: `Bạn đang thực hiện mua khóa học: "${course.title}"`,
        actionType: 'PAYMENT',
        amount: finalPrice,
        currentBalance,
        onConfirm: async () => {
          await mutation.mutateAsync(course.id).catch(() => {});
        }
      });
    } else {
      mutation.mutate(course.id);
    }
  };

  return {
    handleCheckout,
    isProcessing: mutation.isPending
  };
};

export const useMockDeposit = () => {
  const queryClient = useQueryClient();
  const closeDepositModal = useBillingUIStore((state) => state.closeDepositModal);

  return useMutation({
    mutationFn: (amount: number) => billingService.deposit(amount),

    onSuccess: (data) => {
      toast.success('Nạp tiền thành công!', {
        description: `Số dư ví hiện tại: ${data.balance.toLocaleString()}đ`
      });

      useAuthStore.getState().updateBalance(data.balance);

      queryClient.invalidateQueries({ queryKey: courseQueryKeys.walletBalance() });
      queryClient.invalidateQueries({ queryKey: WALLET_TRANSACTIONS_KEY });

      closeDepositModal();
    },

    onError: (error) => {
      const parsed = parseApiError(error);
      toast.error('Giao dịch thất bại', { description: parsed.message });
      closeDepositModal();
    }
  });
};

export const useSyncWallet = (): UseQueryResult<{ balance: number; status: string }, Error> => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: courseQueryKeys.walletBalance(),
    queryFn: billingService.getMyWallet,
    enabled: isAuthenticated,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
    retry: 1,
  });
};

export const useMyTransactions = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: [...WALLET_TRANSACTIONS_KEY, page, limit],
    queryFn: () => billingService.getMyTransactions({ page, limit }),
    staleTime: 1000 * 60,
  });
};

type CreatePaymentLinkArgs = { amount: number; returnPath?: string };

export const useBillingFlows = () => {
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: ({ amount, returnPath }: CreatePaymentLinkArgs) =>
      billingService.createPaymentLink(amount, returnPath),
    onError: (err) => {
      const parsed = parseApiError(err);
      setError(parsed.message);
    },
  });

  return {
    createPaymentLink: async (
      amount: number,
      returnPath?: string,
    ): Promise<CreatePaymentLinkResponse> => {
      setError(null);
      return mutation.mutateAsync({ amount, returnPath });
    },
    isPending: mutation.isPending,
    error,
    setError,
  };
};