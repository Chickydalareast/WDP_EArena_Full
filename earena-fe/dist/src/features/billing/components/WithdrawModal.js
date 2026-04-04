'use client';
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.WithdrawModal = WithdrawModal;
const react_1 = __importStar(require("react"));
const react_hook_form_1 = require("react-hook-form");
const rhf_zod_resolver_1 = require("@/shared/lib/rhf-zod-resolver");
const auth_store_1 = require("@/features/auth/stores/auth.store");
const transaction_confirm_store_1 = require("../stores/transaction-confirm.store");
const billing_schema_1 = require("../types/billing.schema");
const useTeacherWallet_1 = require("../hooks/useTeacherWallet");
const dialog_1 = require("@/shared/components/ui/dialog");
const form_1 = require("@/shared/components/ui/form");
const input_1 = require("@/shared/components/ui/input");
const button_1 = require("@/shared/components/ui/button");
const lucide_react_1 = require("lucide-react");
const sonner_1 = require("sonner");
function WithdrawModal() {
    const [open, setOpen] = (0, react_1.useState)(false);
    const balance = (0, auth_store_1.useAuthStore)((state) => state.user?.balance ?? 0);
    const openConfirm = (0, transaction_confirm_store_1.useTransactionConfirmStore)((state) => state.openConfirm);
    const form = (0, react_hook_form_1.useForm)({
        resolver: (0, rhf_zod_resolver_1.rhfZodResolver)(billing_schema_1.withdrawSchema),
        defaultValues: {
            amount: 100000,
            bankName: '',
            accountNumber: '',
            accountName: '',
        },
    });
    const { mutateAsync, isPending } = (0, useTeacherWallet_1.useWithdrawMutation)(() => {
        setOpen(false);
        form.reset();
    });
    const onSubmit = (data) => {
        if (data.amount > balance) {
            sonner_1.toast.error('Số dư không đủ', { description: `Bạn chỉ có thể rút tối đa ${balance.toLocaleString()}đ` });
            form.setError('amount', { type: 'manual', message: 'Vượt quá số dư khả dụng' });
            return;
        }
        openConfirm({
            title: 'Xác nhận rút doanh thu',
            description: `Rút tiền về tài khoản ngân hàng: ${data.bankName} - ${data.accountNumber}`,
            actionType: 'WITHDRAW',
            amount: data.amount,
            currentBalance: balance,
            onConfirm: async () => {
                await mutateAsync(data).catch(() => { });
            }
        });
    };
    return (<dialog_1.Dialog open={open} onOpenChange={setOpen}>
            <dialog_1.DialogTrigger asChild>
                <button_1.Button size="lg" variant="outline" className="w-full text-foreground border-border hover:bg-secondary font-bold h-14 rounded-xl shadow-sm transition-transform active:scale-95 text-base">
                    <lucide_react_1.ArrowRightLeft className="w-5 h-5 mr-2"/> Rút doanh thu
                </button_1.Button>
            </dialog_1.DialogTrigger>

            <dialog_1.DialogContent className="sm:max-w-md" onInteractOutside={(e) => { if (isPending)
        e.preventDefault(); }}>
                <dialog_1.DialogHeader>
                    <dialog_1.DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <lucide_react_1.ArrowRightLeft className="w-6 h-6 text-primary"/>
                        Yêu cầu rút tiền
                    </dialog_1.DialogTitle>
                    <dialog_1.DialogDescription>
                        Vui lòng nhập thông tin ngân hàng thụ hưởng.
                    </dialog_1.DialogDescription>
                </dialog_1.DialogHeader>

                <form_1.Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
                        <form_1.FormField control={form.control} name="amount" render={({ field }) => (<form_1.FormItem>
                                    <form_1.FormLabel className="font-bold">Số tiền rút (VNĐ)</form_1.FormLabel>
                                    <form_1.FormControl>
                                        <input_1.Input type="number" className="rounded-xl h-11" placeholder="Ví dụ: 500000" {...field} disabled={isPending}/>
                                    </form_1.FormControl>
                                    <form_1.FormMessage className="font-bold"/>
                                </form_1.FormItem>)}/>
                        <form_1.FormField control={form.control} name="bankName" render={({ field }) => (<form_1.FormItem>
                                    <form_1.FormLabel className="font-bold">Ngân hàng</form_1.FormLabel>
                                    <form_1.FormControl>
                                        <input_1.Input className="rounded-xl h-11" placeholder="Ví dụ: Vietcombank" {...field} disabled={isPending}/>
                                    </form_1.FormControl>
                                    <form_1.FormMessage className="font-bold"/>
                                </form_1.FormItem>)}/>
                        <form_1.FormField control={form.control} name="accountNumber" render={({ field }) => (<form_1.FormItem>
                                    <form_1.FormLabel className="font-bold">Số tài khoản</form_1.FormLabel>
                                    <form_1.FormControl>
                                        <input_1.Input className="rounded-xl h-11" placeholder="Nhập số tài khoản" {...field} disabled={isPending}/>
                                    </form_1.FormControl>
                                    <form_1.FormMessage className="font-bold"/>
                                </form_1.FormItem>)}/>
                        <form_1.FormField control={form.control} name="accountName" render={({ field }) => (<form_1.FormItem>
                                    <form_1.FormLabel className="font-bold">Tên chủ tài khoản</form_1.FormLabel>
                                    <form_1.FormControl>
                                        <input_1.Input placeholder="NGUYEN VAN A" className="uppercase rounded-xl h-11" {...field} disabled={isPending}/>
                                    </form_1.FormControl>
                                    <form_1.FormMessage className="font-bold"/>
                                </form_1.FormItem>)}/>

                        <div className="pt-6 border-t border-border flex justify-end gap-3">
                            <button_1.Button type="button" variant="outline" className="rounded-xl font-bold" onClick={() => setOpen(false)} disabled={isPending}>
                                Hủy
                            </button_1.Button>
                            <button_1.Button type="submit" disabled={isPending} className="font-bold rounded-xl min-w-[120px] bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
                                {isPending ? <lucide_react_1.Loader2 className="w-4 h-4 animate-spin"/> : 'Tiếp tục'}
                            </button_1.Button>
                        </div>
                    </form>
                </form_1.Form>
            </dialog_1.DialogContent>
        </dialog_1.Dialog>);
}
//# sourceMappingURL=WithdrawModal.js.map