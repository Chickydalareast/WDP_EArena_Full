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

    // Fallback an toàn nếu state rỗng (mặc dù isOpen đã chặn render content)
    if (!payload) return null;

    const { title, description, actionType, amount, currentBalance, onConfirm } = payload;

    // Domain logic tính toán hiển thị
    const isDeduction = actionType === 'WITHDRAW' || actionType === 'PAYMENT';
    const newBalance = isDeduction ? currentBalance - amount : currentBalance + amount;

    const amountSign = isDeduction ? '-' : '+';
    const amountColor = isDeduction ? 'text-red-600' : 'text-green-600';
    const bgBadgeColor = isDeduction ? 'bg-red-50' : 'bg-green-50';

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
            setIsProcessing(false); // Luôn nhả lock dù thành công hay thất bại
        }
    };

    // Ngăn chặn tắt Modal khi đang call API
    const handleOpenChange = (open: boolean) => {
        if (isProcessing) return;
        if (!open) closeConfirm();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            {/* onInteractOutside cũng cần bị block khi isProcessing */}
            <DialogContent
                className="sm:max-w-md"
                onInteractOutside={(e) => { if (isProcessing) e.preventDefault(); }}
            >
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl border-b pb-3">
                        <ShieldCheck className="w-6 h-6 text-indigo-600" />
                        {title}
                    </DialogTitle>
                    {description && (
                        <DialogDescription className="pt-2 text-sm text-slate-600">
                            {description}
                        </DialogDescription>
                    )}
                </DialogHeader>

                <div className="py-4 space-y-4">
                    {/* Bill Summary Box */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 shadow-inner">
                        <div className="flex justify-between items-center text-sm font-medium text-slate-500">
                            <span>Số dư hiện tại</span>
                            <span className="text-slate-800">{formatVND(currentBalance)}</span>
                        </div>

                        <div className={cn("flex justify-between items-center text-base font-bold p-2 rounded-lg", bgBadgeColor, amountColor)}>
                            <span>Số tiền giao dịch</span>
                            <span>{amountSign}{formatVND(amount)}</span>
                        </div>

                        <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                            <span className="text-sm font-semibold text-slate-700">Số dư dự kiến</span>
                            <div className="flex items-center gap-2 text-lg font-bold text-indigo-700">
                                <ArrowRight className="w-4 h-4 text-slate-400" />
                                {formatVND(newBalance)}
                            </div>
                        </div>
                    </div>

                    {actionType === 'WITHDRAW' && (
                        <div className="flex gap-2 text-sm text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p>Số tiền này sẽ được trừ khỏi ví và đóng băng chờ Admin duyệt.</p>
                        </div>
                    )}
                    {actionType === 'PAYMENT' && (
                        <div className="flex gap-2 text-sm text-blue-700 bg-blue-50 p-3 rounded-lg border border-blue-200">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p>Giao dịch mua khóa học không thể hoàn tác. Bạn chắc chắn chứ?</p>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
                    <Button
                        variant="outline"
                        onClick={closeConfirm}
                        disabled={isProcessing}
                        className="w-full sm:w-auto font-medium"
                    >
                        Hủy bỏ
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={isProcessing}
                        className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold min-w-[140px]"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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