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
exports.ProcessWithdrawalModal = ProcessWithdrawalModal;
const react_1 = __importStar(require("react"));
const react_hook_form_1 = require("react-hook-form");
const rhf_zod_resolver_1 = require("@/shared/lib/rhf-zod-resolver");
const admin_wallet_schema_1 = require("../types/admin-wallet.schema");
const useAdminWithdrawals_1 = require("../hooks/useAdminWithdrawals");
const dialog_1 = require("@/shared/components/ui/dialog");
const form_1 = require("@/shared/components/ui/form");
const textarea_1 = require("@/shared/components/ui/textarea");
const button_1 = require("@/shared/components/ui/button");
const lucide_react_1 = require("lucide-react");
function ProcessWithdrawalModal({ request, onClose }) {
    const isOpen = !!request;
    const { mutate, isPending } = (0, useAdminWithdrawals_1.useProcessWithdrawal)(() => {
        onClose();
    });
    const form = (0, react_hook_form_1.useForm)({
        resolver: (0, rhf_zod_resolver_1.rhfZodResolver)(admin_wallet_schema_1.processWithdrawalSchema),
        defaultValues: {
            action: 'APPROVE',
        },
    });
    (0, react_1.useEffect)(() => {
        if (isOpen) {
            form.reset({ action: 'APPROVE' });
        }
    }, [isOpen, form]);
    const actionValue = form.watch('action');
    if (!request)
        return null;
    const onSubmit = (data) => {
        mutate({ id: request._id, payload: data });
    };
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };
    return (<dialog_1.Dialog open={isOpen} onOpenChange={(open) => !open && !isPending && onClose()}>
            <dialog_1.DialogContent className="sm:max-w-lg">
                <dialog_1.DialogHeader>
                    <dialog_1.DialogTitle className="text-xl font-bold">Xử lý yêu cầu rút tiền</dialog_1.DialogTitle>
                    <dialog_1.DialogDescription>
                        Phiếu yêu cầu: <span className="font-mono text-xs font-semibold">{request._id}</span>
                    </dialog_1.DialogDescription>
                </dialog_1.DialogHeader>

                <div className="bg-slate-50 border border-border rounded-xl p-4 my-2 text-sm space-y-3">
                    <div className="flex justify-between border-b border-border pb-2">
                        <span className="text-muted-foreground">Giáo viên:</span>
                        <span className="font-bold text-slate-800">{request.teacherId.fullName}</span>
                    </div>
                    <div className="flex justify-between border-b border-border pb-2">
                        <span className="text-muted-foreground">Số tiền rút:</span>
                        <span className="font-bold text-red-600 text-lg">{formatCurrency(request.amount)}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-1">
                        <div className="col-span-1 text-muted-foreground">Ngân hàng:</div>
                        <div className="col-span-2 font-semibold text-right">{request.bankInfo.bankName}</div>
                        <div className="col-span-1 text-muted-foreground">Số TK:</div>
                        <div className="col-span-2 font-mono font-bold text-right tracking-wider">{request.bankInfo.accountNumber}</div>
                        <div className="col-span-1 text-muted-foreground">Chủ TK:</div>
                        <div className="col-span-2 font-semibold text-right">{request.bankInfo.accountName}</div>
                    </div>
                </div>

                <form_1.Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <form_1.FormField control={form.control} name="action" render={({ field }) => (<form_1.FormItem className="space-y-3">
                                    <form_1.FormLabel>Quyết định xử lý</form_1.FormLabel>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className={`border-2 rounded-xl p-3 cursor-pointer flex items-center justify-center gap-2 transition-all ${field.value === 'APPROVE' ? 'border-green-500 bg-green-50 text-green-700' : 'border-border text-muted-foreground hover:bg-slate-50'}`} onClick={() => !isPending && form.setValue('action', 'APPROVE')}>
                                            <lucide_react_1.CheckCircle2 className="w-5 h-5"/> <span className="font-bold">Duyệt & Đã CK</span>
                                        </div>
                                        <div className={`border-2 rounded-xl p-3 cursor-pointer flex items-center justify-center gap-2 transition-all ${field.value === 'REJECT' ? 'border-red-500 bg-red-50 text-red-700' : 'border-border text-muted-foreground hover:bg-slate-50'}`} onClick={() => !isPending && form.setValue('action', 'REJECT')}>
                                            <lucide_react_1.XCircle className="w-5 h-5"/> <span className="font-bold">Từ chối (Hoàn tiền)</span>
                                        </div>
                                    </div>
                                </form_1.FormItem>)}/>

                        {actionValue === 'REJECT' && (<form_1.FormField control={form.control} name="rejectionReason" render={({ field }) => (<form_1.FormItem className="animate-in fade-in slide-in-from-top-2">
                                        <form_1.FormLabel className="text-red-600 flex items-center gap-1">
                                            <lucide_react_1.AlertCircle className="w-4 h-4"/> Lý do từ chối (Bắt buộc)
                                        </form_1.FormLabel>
                                        <form_1.FormControl>
                                            <textarea_1.Textarea placeholder="Nhập lý do để thông báo qua Email cho Giáo viên..." className="resize-none" disabled={isPending} {...field}/>
                                        </form_1.FormControl>
                                        <form_1.FormMessage />
                                    </form_1.FormItem>)}/>)}

                        <dialog_1.DialogFooter className="gap-2 sm:gap-0 pt-2">
                            <button_1.Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                                Hủy
                            </button_1.Button>
                            <button_1.Button type="submit" disabled={isPending} className={`font-bold min-w-[120px] ${actionValue === 'APPROVE' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}>
                                {isPending && <lucide_react_1.Loader2 className="w-4 h-4 animate-spin mr-2"/>}
                                {actionValue === 'APPROVE' ? 'Xác nhận Duyệt' : 'Xác nhận Từ chối'}
                            </button_1.Button>
                        </dialog_1.DialogFooter>
                    </form>
                </form_1.Form>
            </dialog_1.DialogContent>
        </dialog_1.Dialog>);
}
//# sourceMappingURL=ProcessWithdrawalModal.js.map