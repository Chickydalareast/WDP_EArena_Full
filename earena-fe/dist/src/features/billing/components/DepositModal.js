'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepositModal = DepositModal;
const react_1 = require("react");
const react_hook_form_1 = require("react-hook-form");
const rhf_zod_resolver_1 = require("@/shared/lib/rhf-zod-resolver");
const dialog_1 = require("@/shared/components/ui/dialog");
const button_1 = require("@/shared/components/ui/button");
const input_1 = require("@/shared/components/ui/input");
const billing_ui_store_1 = require("../stores/billing-ui.store");
const transaction_confirm_store_1 = require("../stores/transaction-confirm.store");
const useBillingFlows_1 = require("../hooks/useBillingFlows");
const auth_store_1 = require("@/features/auth/stores/auth.store");
const billing_schema_1 = require("../types/billing.schema");
const lucide_react_1 = require("lucide-react");
function DepositModal() {
    const { isDepositModalOpen, requiredAmount, closeDepositModal } = (0, billing_ui_store_1.useBillingUIStore)();
    const openConfirm = (0, transaction_confirm_store_1.useTransactionConfirmStore)((state) => state.openConfirm);
    const balance = (0, auth_store_1.useAuthStore)((state) => state.user?.balance ?? 0);
    const { mutateAsync: processDepositAsync, isPending } = (0, useBillingFlows_1.useMockDeposit)();
    const { register, handleSubmit, formState: { errors }, reset, setValue, } = (0, react_hook_form_1.useForm)({
        resolver: (0, rhf_zod_resolver_1.rhfZodResolver)(billing_schema_1.depositSchema),
        defaultValues: { amount: 50000 },
    });
    (0, react_1.useEffect)(() => {
        if (isDepositModalOpen && requiredAmount > 0) {
            const suggestedAmount = Math.ceil(requiredAmount / 10000) * 10000;
            setValue('amount', suggestedAmount);
        }
    }, [isDepositModalOpen, requiredAmount, setValue]);
    const onSubmit = (data) => {
        openConfirm({
            title: 'Xác nhận nạp tiền',
            description: 'Bạn đang yêu cầu nạp thêm tiền vào ví hệ thống.',
            actionType: 'DEPOSIT',
            amount: data.amount,
            currentBalance: balance,
            onConfirm: async () => {
                await processDepositAsync(data.amount)
                    .then(() => reset())
                    .catch(() => { });
            }
        });
    };
    return (<dialog_1.Dialog open={isDepositModalOpen} onOpenChange={(isOpen) => !isOpen && closeDepositModal()}>
      <dialog_1.DialogContent className="sm:max-w-md" onInteractOutside={(e) => { if (isPending)
        e.preventDefault(); }}>
        <dialog_1.DialogHeader>
          <dialog_1.DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <lucide_react_1.Wallet className="text-primary w-6 h-6"/>
            Nạp tiền vào hệ thống
          </dialog_1.DialogTitle>
          <dialog_1.DialogDescription className="pt-2">
            Số dư hiện tại: <strong className="text-primary text-base">{balance.toLocaleString()}đ</strong>
            {requiredAmount > 0 && (<span className="block mt-3 text-amber-700 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl border border-amber-200 dark:border-amber-800/50">
                Bạn cần nạp thêm ít nhất <strong>{requiredAmount.toLocaleString()}đ</strong> để thực hiện giao dịch này.
              </span>)}
          </dialog_1.DialogDescription>
        </dialog_1.DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-2">
          <div className="space-y-3">
            <label htmlFor="amount" className="text-sm font-bold text-foreground">
              Nhập số tiền cần nạp (VND) <span className="text-destructive">*</span>
            </label>
            <input_1.Input id="amount" type="number" placeholder="VD: 100000" disabled={isPending} {...register('amount')} className={`h-12 text-lg font-bold rounded-xl ${errors.amount ? 'border-destructive focus-visible:ring-destructive' : 'focus-visible:ring-primary'}`}/>
            {errors.amount && (<p className="text-xs font-bold text-destructive">{errors.amount.message}</p>)}
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[50000, 100000, 200000, 500000].map((amt) => (<button key={amt} type="button" className="text-sm font-bold text-foreground bg-secondary hover:bg-primary/10 hover:text-primary py-2.5 rounded-lg transition-colors border border-border hover:border-primary/30" onClick={() => setValue('amount', amt, { shouldValidate: true })} disabled={isPending}>
                {amt / 1000}k
              </button>))}
          </div>

          <div className="flex justify-end gap-3 w-full pt-6 border-t border-border">
            <button_1.Button type="button" variant="outline" className="rounded-xl font-bold" onClick={closeDepositModal} disabled={isPending}>
              Hủy bỏ
            </button_1.Button>
            <button_1.Button type="submit" disabled={isPending} className="min-w-[140px] rounded-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-transform active:scale-95">
              {isPending ? (<>
                  <lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                  Đang xử lý...
                </>) : (<>
                  <lucide_react_1.ShieldCheck className="mr-2 h-5 w-5"/> Tiếp tục
                </>)}
            </button_1.Button>
          </div>
        </form>
      </dialog_1.DialogContent>
    </dialog_1.Dialog>);
}
//# sourceMappingURL=DepositModal.js.map