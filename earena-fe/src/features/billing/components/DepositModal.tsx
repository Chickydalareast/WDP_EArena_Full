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
  
  // Đổi sang mutateAsync để đợi kết quả trả về trong Modal Xác nhận
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
    // Intercept: Chặn luồng nạp trực tiếp, mở bảng Tóm tắt giao dịch
    openConfirm({
      title: 'Xác nhận nạp tiền',
      description: 'Bạn đang yêu cầu nạp thêm tiền vào ví hệ thống.',
      actionType: 'DEPOSIT',
      amount: data.amount,
      currentBalance: balance,
      onConfirm: async () => {
        // Gọi API nạp tiền. Dùng .then để chỉ reset form khi thành công.
        // Dùng .catch để nuốt lỗi, nhường việc toast lỗi cho hook useMockDeposit.
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
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Wallet className="text-blue-600 w-6 h-6" />
            Nạp tiền vào hệ thống
          </DialogTitle>
          <DialogDescription>
            Số dư hiện tại: <strong className="text-blue-600">{balance.toLocaleString()}đ</strong>
            {requiredAmount > 0 && (
              <span className="block mt-1 text-amber-600 bg-amber-50 p-2 rounded-md border border-amber-100">
                Bạn cần nạp thêm ít nhất <strong>{requiredAmount.toLocaleString()}đ</strong> để thực hiện giao dịch này.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          <div className="space-y-2">
            <label htmlFor="amount" className="text-sm font-semibold text-slate-700">
              Nhập số tiền cần nạp (VND) <span className="text-red-500">*</span>
            </label>
            <Input
              id="amount"
              type="number"
              placeholder="VD: 100000"
              disabled={isPending}
              {...register('amount')}
              className={`h-11 text-lg font-medium ${errors.amount ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
            />
            {errors.amount && (
              <p className="text-[12px] font-medium text-red-500">{errors.amount.message}</p>
            )}
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[50000, 100000, 200000, 500000].map((amt) => (
              <button
                key={amt}
                type="button"
                className="text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-blue-100 hover:text-blue-700 py-2 rounded-md transition-colors border border-slate-200"
                onClick={() => setValue('amount', amt, { shouldValidate: true })}
                disabled={isPending}
              >
                {amt / 1000}k
              </button>
            ))}
          </div>

          <div className="flex justify-end gap-3 w-full pt-4 border-t border-border">
            <Button type="button" variant="ghost" onClick={closeDepositModal} disabled={isPending}>
              Hủy bỏ
            </Button>
            <Button type="submit" disabled={isPending} className="min-w-[140px] bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-transform active:scale-95">
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <ShieldCheck className="mr-2 h-4 w-4" /> Tiếp tục
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}