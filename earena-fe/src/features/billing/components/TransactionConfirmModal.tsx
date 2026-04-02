'use client';

import React, { useState } from 'react';
import { useTransactionConfirmStore } from '../stores/transaction-confirm.store';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Loader2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { toast } from 'sonner';

export function TransactionConfirmModal() {
    const { isOpen, payload, closeConfirm } = useTransactionConfirmStore();
    const [isProcessing, setIsProcessing] = useState(false);

    if (!payload) return null;

    const { title, description, actionType, amount, currentBalance, onConfirm } = payload;

    const isDeduction = actionType === 'WITHDRAW' || actionType === 'PAYMENT';
    const newBalance = isDeduction ? currentBalance - amount : currentBalance + amount;

    const amountSign = isDeduction ? '-' : '+';
    // Đỏ cho trừ tiền, Xanh lá cho cộng tiền (Semantic Colors)
    const amountColor = isDeduction ? 'text-destructive' : 'text-green-600 dark:text-green-500';
    const bgBadgeColor = isDeduction ? 'bg-destructive/10' : 'bg-green-100 dark:bg-green-900/30';

    const formatVND = (value: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

    const handleConfirm = async () => {
        try {
            setIsProcessing(true);
            await onConfirm();
            closeConfirm();
        } catch (error) {
            console.error('Transaction Failed:', error);
            toast.error('Giao dịch thất bại', { description: 'Đã có lỗi xảy ra, vui lòng thử lại.' });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleOpenChange = (open: boolean) => {
        if (isProcessing) return;
        if (!open) closeConfirm();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent
                className="sm:max-w-md"
                onInteractOutside={(e) => { if (isProcessing) e.preventDefault(); }}
            >
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl border-b border-border pb-4 font-black text-foreground">
                        <ShieldCheck className="w-7 h-7 text-primary" />
                        {title}
                    </DialogTitle>
                    {description && (
                        <DialogDescription className="pt-3 text-sm font-medium">
                            {description}
                        </DialogDescription>
                    )}
                </DialogHeader>

                <div className="py-2 space-y-4">
                    {/* Bill Summary Box */}
                    <div className="bg-secondary/40 border border-border rounded-2xl p-5 space-y-4 shadow-inner">
                        <div className="flex justify-between items-center text-sm font-bold text-muted-foreground">
                            <span>Số dư hiện tại</span>
                            <span className="text-foreground text-base">{formatVND(currentBalance)}</span>
                        </div>

                        <div className={cn("flex justify-between items-center text-lg font-black p-3 rounded-xl", bgBadgeColor, amountColor)}>
                            <span>Số tiền giao dịch</span>
                            <span>{amountSign}{formatVND(amount)}</span>
                        </div>

                        <div className="pt-4 border-t border-border flex justify-between items-center">
                            <span className="text-sm font-bold text-foreground">Số dư dự kiến</span>
                            <div className="flex items-center gap-2 text-xl font-black text-primary">
                                <ArrowRight className="w-5 h-5 text-muted-foreground" />
                                {formatVND(newBalance)}
                            </div>
                        </div>
                    </div>

                    {actionType === 'WITHDRAW' && (
                        <div className="flex gap-3 text-sm font-medium text-amber-700 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800/50">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p>Số tiền này sẽ được trừ khỏi ví và đóng băng chờ Admin duyệt.</p>
                        </div>
                    )}
                    {actionType === 'PAYMENT' && (
                        <div className="flex gap-3 text-sm font-medium text-destructive bg-destructive/10 p-4 rounded-xl border border-destructive/20">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p>Giao dịch mua khóa học không thể hoàn tác. Bạn chắc chắn chứ?</p>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-3 pt-4 border-t border-border mt-2">
                    <Button
                        variant="outline"
                        onClick={closeConfirm}
                        disabled={isProcessing}
                        className="w-full sm:w-auto font-bold rounded-xl h-11"
                    >
                        Hủy bỏ
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={isProcessing}
                        className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-bold min-w-[140px] rounded-xl h-11 shadow-lg shadow-primary/20 transition-transform active:scale-95"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Đang xử lý...
                            </>
                        ) : (
                            'Xác nhận giao dịch'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}