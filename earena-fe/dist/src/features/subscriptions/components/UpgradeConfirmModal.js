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
exports.UpgradeConfirmModal = UpgradeConfirmModal;
const react_1 = __importStar(require("react"));
const react_hook_form_1 = require("react-hook-form");
const rhf_zod_resolver_1 = require("@/shared/lib/rhf-zod-resolver");
const subscription_schema_1 = require("../types/subscription.schema");
const useSubscriptions_1 = require("../hooks/useSubscriptions");
const dialog_1 = require("@/shared/components/ui/dialog");
const form_1 = require("@/shared/components/ui/form");
const button_1 = require("@/shared/components/ui/button");
const lucide_react_1 = require("lucide-react");
const utils_1 = require("@/shared/lib/utils");
function UpgradeConfirmModal({ plan, onClose }) {
    const isOpen = !!plan;
    const { mutate: upgradePlan, isPending } = (0, useSubscriptions_1.useUpgradePlan)(() => {
        onClose();
    });
    const form = (0, react_hook_form_1.useForm)({
        resolver: (0, rhf_zod_resolver_1.rhfZodResolver)(subscription_schema_1.upgradeSubscriptionSchema),
        defaultValues: {
            planId: '',
            billingCycle: 'MONTHLY',
        },
    });
    (0, react_1.useEffect)(() => {
        if (plan) {
            form.reset({ planId: plan._id, billingCycle: 'MONTHLY' });
        }
    }, [plan, form]);
    const billingCycle = form.watch('billingCycle');
    if (!plan)
        return null;
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };
    const onSubmit = (data) => {
        upgradePlan(data);
    };
    return (<dialog_1.Dialog open={isOpen} onOpenChange={(open) => !open && !isPending && onClose()}>
            <dialog_1.DialogContent className="sm:max-w-md">
                <dialog_1.DialogHeader>
                    <dialog_1.DialogTitle className="text-2xl font-black flex items-center gap-2 text-foreground">
                        <lucide_react_1.CreditCard className="w-7 h-7 text-primary"/> Xác nhận thanh toán
                    </dialog_1.DialogTitle>
                    <dialog_1.DialogDescription className="pt-2 font-medium">
                        Bạn đang chọn gói <span className="font-bold text-foreground uppercase tracking-widest bg-secondary px-2 py-0.5 rounded">{plan.name}</span>. Vui lòng chọn chu kỳ thanh toán.
                    </dialog_1.DialogDescription>
                </dialog_1.DialogHeader>

                <form_1.Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
                        <form_1.FormField control={form.control} name="billingCycle" render={() => (<form_1.FormItem>
                                    <form_1.FormControl>
                                        <div className="grid grid-cols-2 gap-4">
                                            
                                            <div onClick={() => !isPending && form.setValue('billingCycle', 'MONTHLY')} className={(0, utils_1.cn)("cursor-pointer rounded-2xl border-2 p-5 flex flex-col items-center justify-center gap-2 transition-all", billingCycle === 'MONTHLY'
                ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                : "border-border hover:bg-secondary/50 text-muted-foreground")}>
                                                <lucide_react_1.Calendar className={(0, utils_1.cn)("w-6 h-6", billingCycle === 'MONTHLY' && "text-primary")}/>
                                                <div className="text-sm font-bold">Gói 1 Tháng</div>
                                                <div className={(0, utils_1.cn)("text-xl font-black", billingCycle === 'MONTHLY' && "text-primary")}>
                                                    {formatCurrency(plan.priceMonthly)}
                                                </div>
                                            </div>

                                            
                                            <div onClick={() => !isPending && form.setValue('billingCycle', 'YEARLY')} className={(0, utils_1.cn)("relative cursor-pointer rounded-2xl border-2 p-5 flex flex-col items-center justify-center gap-2 transition-all", billingCycle === 'YEARLY'
                ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                : "border-border hover:bg-secondary/50 text-muted-foreground")}>
                                                <div className="absolute -top-3 bg-green-500 dark:bg-green-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-sm tracking-wider border border-green-400">
                                                    TIẾT KIỆM 20%
                                                </div>
                                                <lucide_react_1.Calendar className={(0, utils_1.cn)("w-6 h-6", billingCycle === 'YEARLY' && "text-primary")}/>
                                                <div className="text-sm font-bold">Gói 1 Năm</div>
                                                <div className={(0, utils_1.cn)("text-xl font-black", billingCycle === 'YEARLY' && "text-primary")}>
                                                    {formatCurrency(plan.priceYearly)}
                                                </div>
                                            </div>
                                        </div>
                                    </form_1.FormControl>
                                    <form_1.FormMessage />
                                </form_1.FormItem>)}/>

                        
                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 text-amber-700 dark:text-amber-500 text-xs font-medium p-4 rounded-xl flex items-start gap-3">
                            <lucide_react_1.AlertCircle className="w-5 h-5 shrink-0"/>
                            <p>Hệ thống sẽ tự động tính toán <strong>khấu trừ (nếu có)</strong> dựa trên số ngày còn lại của gói cước hiện tại. Số tiền bị trừ trong ví có thể thấp hơn mức giá hiển thị.</p>
                        </div>

                        <dialog_1.DialogFooter className="gap-3 sm:gap-0 pt-2 border-t border-border">
                            <button_1.Button type="button" variant="outline" className="rounded-xl font-bold h-11" onClick={onClose} disabled={isPending}>
                                Hủy bỏ
                            </button_1.Button>
                            <button_1.Button type="submit" disabled={isPending} className="font-bold min-w-[140px] rounded-xl h-11 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
                                {isPending ? <lucide_react_1.Loader2 className="w-4 h-4 animate-spin mr-2"/> : null}
                                {isPending ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
                            </button_1.Button>
                        </dialog_1.DialogFooter>
                    </form>
                </form_1.Form>
            </dialog_1.DialogContent>
        </dialog_1.Dialog>);
}
//# sourceMappingURL=UpgradeConfirmModal.js.map