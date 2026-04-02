'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { useBillingUIStore } from '../stores/billing-ui.store';
import { useTransactionConfirmStore } from '../stores/transaction-confirm.store';
import { useMockDeposit } from '../hooks/useBillingFlows';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { depositSchema, DepositFormDTO } from '../types/billing.schema';
import { Loader2, Wallet, ShieldCheck } from 'lucide-react';

export function DepositModal() {
  const { isDepositModalOpen, requiredAmount, closeDepositModal } = useBillingUIStore();
  const openConfirm = useTransactionConfirmStore((state) => state.openConfirm);
  const balance = useAuthStore((state) => state.user?.balance ?? 0);
  
  const { mutateAsync: processDepositAsync, isPending } = useMockDeposit();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<DepositFormDTO>({
    resolver: zodResolver(depositSchema),
    defaultValues: { amount: 50000 },
  });

  useEffect(() => {
    if (isDepositModalOpen && requiredAmount > 0) {
      const suggestedAmount = Math.ceil(requiredAmount / 10000) * 10000;
      setValue('amount', suggestedAmount);
    }
  }, [isDepositModalOpen, requiredAmount, setValue]);

  const onSubmit = (data: DepositFormDTO) => {
    openConfirm({
      title: 'Xác nhận nạp tiền',
      description: 'Bạn đang yêu cầu nạp thêm tiền vào ví hệ thống.',
      actionType: 'DEPOSIT',
      amount: data.amount,
      currentBalance: balance,
      onConfirm: async () => {
        await processDepositAsync(data.amount)
          .then(() => reset())
          .catch(() => {});
      }
    });
  };

  return (
    <Dialog open={isDepositModalOpen} onOpenChange={(isOpen) => !isOpen && closeDepositModal()}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => { if (isPending) e.preventDefault(); }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Wallet className="text-primary w-6 h-6" />
            Nạp tiền vào hệ thống
          </DialogTitle>
          <DialogDescription className="pt-2">
            Số dư hiện tại: <strong className="text-primary text-base">{balance.toLocaleString()}đ</strong>
            {requiredAmount > 0 && (
              <span className="block mt-3 text-amber-700 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl border border-amber-200 dark:border-amber-800/50">
                Bạn cần nạp thêm ít nhất <strong>{requiredAmount.toLocaleString()}đ</strong> để thực hiện giao dịch này.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-2">
          <div className="space-y-3">
            <label htmlFor="amount" className="text-sm font-bold text-foreground">
              Nhập số tiền cần nạp (VND) <span className="text-destructive">*</span>
            </label>
            <Input
              id="amount"
              type="number"
              placeholder="VD: 100000"
              disabled={isPending}
              {...register('amount')}
              className={`h-12 text-lg font-bold rounded-xl ${errors.amount ? 'border-destructive focus-visible:ring-destructive' : 'focus-visible:ring-primary'}`}
            />
            {errors.amount && (
              <p className="text-xs font-bold text-destructive">{errors.amount.message}</p>
            )}
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[50000, 100000, 200000, 500000].map((amt) => (
              <button
                key={amt}
                type="button"
                className="text-sm font-bold text-foreground bg-secondary hover:bg-primary/10 hover:text-primary py-2.5 rounded-lg transition-colors border border-border hover:border-primary/30"
                onClick={() => setValue('amount', amt, { shouldValidate: true })}
                disabled={isPending}
              >
                {amt / 1000}k
              </button>
            ))}
          </div>

          <div className="flex justify-end gap-3 w-full pt-6 border-t border-border">
            <Button type="button" variant="outline" className="rounded-xl font-bold" onClick={closeDepositModal} disabled={isPending}>
              Hủy bỏ
            </Button>
            <Button type="submit" disabled={isPending} className="min-w-[140px] rounded-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-transform active:scale-95">
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <ShieldCheck className="mr-2 h-5 w-5" /> Tiếp tục
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}