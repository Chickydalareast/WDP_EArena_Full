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
exports.TransactionConfirmModal = TransactionConfirmModal;
const react_1 = __importStar(require("react"));
const transaction_confirm_store_1 = require("../stores/transaction-confirm.store");
const dialog_1 = require("@/shared/components/ui/dialog");
const button_1 = require("@/shared/components/ui/button");
const lucide_react_1 = require("lucide-react");
const utils_1 = require("@/shared/lib/utils");
const sonner_1 = require("sonner");
function TransactionConfirmModal() {
    const { isOpen, payload, closeConfirm } = (0, transaction_confirm_store_1.useTransactionConfirmStore)();
    const [isProcessing, setIsProcessing] = (0, react_1.useState)(false);
    if (!payload)
        return null;
    const { title, description, actionType, amount, currentBalance, onConfirm } = payload;
    const isDeduction = actionType === 'WITHDRAW' || actionType === 'PAYMENT';
    const newBalance = isDeduction ? currentBalance - amount : currentBalance + amount;
    const amountSign = isDeduction ? '-' : '+';
    const amountColor = isDeduction ? 'text-destructive' : 'text-green-600 dark:text-green-500';
    const bgBadgeColor = isDeduction ? 'bg-destructive/10' : 'bg-green-100 dark:bg-green-900/30';
    const formatVND = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    const handleConfirm = async () => {
        try {
            setIsProcessing(true);
            await onConfirm();
            closeConfirm();
        }
        catch (error) {
            console.error('Transaction Failed:', error);
            sonner_1.toast.error('Giao dịch thất bại', { description: 'Đã có lỗi xảy ra, vui lòng thử lại.' });
        }
        finally {
            setIsProcessing(false);
        }
    };
    const handleOpenChange = (open) => {
        if (isProcessing)
            return;
        if (!open)
            closeConfirm();
    };
    return (<dialog_1.Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <dialog_1.DialogContent className="sm:max-w-md" onInteractOutside={(e) => { if (isProcessing)
        e.preventDefault(); }}>
                <dialog_1.DialogHeader>
                    <dialog_1.DialogTitle className="flex items-center gap-2 text-xl border-b border-border pb-4 font-black text-foreground">
                        <lucide_react_1.ShieldCheck className="w-7 h-7 text-primary"/>
                        {title}
                    </dialog_1.DialogTitle>
                    {description && (<dialog_1.DialogDescription className="pt-3 text-sm font-medium">
                            {description}
                        </dialog_1.DialogDescription>)}
                </dialog_1.DialogHeader>

                <div className="py-2 space-y-4">
                    
                    <div className="bg-secondary/40 border border-border rounded-2xl p-5 space-y-4 shadow-inner">
                        <div className="flex justify-between items-center text-sm font-bold text-muted-foreground">
                            <span>Số dư hiện tại</span>
                            <span className="text-foreground text-base">{formatVND(currentBalance)}</span>
                        </div>

                        <div className={(0, utils_1.cn)("flex justify-between items-center text-lg font-black p-3 rounded-xl", bgBadgeColor, amountColor)}>
                            <span>Số tiền giao dịch</span>
                            <span>{amountSign}{formatVND(amount)}</span>
                        </div>

                        <div className="pt-4 border-t border-border flex justify-between items-center">
                            <span className="text-sm font-bold text-foreground">Số dư dự kiến</span>
                            <div className="flex items-center gap-2 text-xl font-black text-primary">
                                <lucide_react_1.ArrowRight className="w-5 h-5 text-muted-foreground"/>
                                {formatVND(newBalance)}
                            </div>
                        </div>
                    </div>

                    {actionType === 'WITHDRAW' && (<div className="flex gap-3 text-sm font-medium text-amber-700 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800/50">
                            <lucide_react_1.AlertCircle className="w-5 h-5 shrink-0"/>
                            <p>Số tiền này sẽ được trừ khỏi ví và đóng băng chờ Admin duyệt.</p>
                        </div>)}
                    {actionType === 'PAYMENT' && (<div className="flex gap-3 text-sm font-medium text-destructive bg-destructive/10 p-4 rounded-xl border border-destructive/20">
                            <lucide_react_1.AlertCircle className="w-5 h-5 shrink-0"/>
                            <p>Giao dịch mua khóa học không thể hoàn tác. Bạn chắc chắn chứ?</p>
                        </div>)}
                </div>

                <dialog_1.DialogFooter className="flex-col sm:flex-row gap-3 pt-4 border-t border-border mt-2">
                    <button_1.Button variant="outline" onClick={closeConfirm} disabled={isProcessing} className="w-full sm:w-auto font-bold rounded-xl h-11">
                        Hủy bỏ
                    </button_1.Button>
                    <button_1.Button onClick={handleConfirm} disabled={isProcessing} className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-bold min-w-[140px] rounded-xl h-11 shadow-lg shadow-primary/20 transition-transform active:scale-95">
                        {isProcessing ? (<>
                                <lucide_react_1.Loader2 className="mr-2 h-5 w-5 animate-spin"/>
                                Đang xử lý...
                            </>) : ('Xác nhận giao dịch')}
                    </button_1.Button>
                </dialog_1.DialogFooter>
            </dialog_1.DialogContent>
        </dialog_1.Dialog>);
}
//# sourceMappingURL=TransactionConfirmModal.js.map