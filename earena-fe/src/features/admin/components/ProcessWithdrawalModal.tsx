'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { processWithdrawalSchema, ProcessWithdrawalDTO, WithdrawalRequest } from '../types/admin-wallet.schema';
import { useProcessWithdrawal } from '../hooks/useAdminWithdrawals';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/shared/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/shared/components/ui/form';
import { Textarea } from '@/shared/components/ui/textarea';
import { Button } from '@/shared/components/ui/button';
import { Loader2, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

interface ProcessWithdrawalModalProps {
    request: WithdrawalRequest | null;
    onClose: () => void;
}

export function ProcessWithdrawalModal({ request, onClose }: ProcessWithdrawalModalProps) {
    const isOpen = !!request;
    const { mutate, isPending } = useProcessWithdrawal(() => {
        onClose();
    });

    const form = useForm<ProcessWithdrawalDTO>({
        resolver: zodResolver(processWithdrawalSchema),
        defaultValues: {
            action: 'APPROVE',
        },
    });

    useEffect(() => {
        if (isOpen) {
            form.reset({ action: 'APPROVE' });
        }
    }, [isOpen, form]);

    const actionValue = form.watch('action');

    if (!request) return null;

    const onSubmit = (data: ProcessWithdrawalDTO) => {
        mutate({ id: request._id, payload: data });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && !isPending && onClose()}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Xử lý yêu cầu rút tiền</DialogTitle>
                    <DialogDescription>
                        Phiếu yêu cầu: <span className="font-mono text-xs font-semibold">{request._id}</span>
                    </DialogDescription>
                </DialogHeader>

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

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="action"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel>Quyết định xử lý</FormLabel>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div
                                            className={`border-2 rounded-xl p-3 cursor-pointer flex items-center justify-center gap-2 transition-all ${field.value === 'APPROVE' ? 'border-green-500 bg-green-50 text-green-700' : 'border-border text-muted-foreground hover:bg-slate-50'}`}
                                            onClick={() => !isPending && form.setValue('action', 'APPROVE')}
                                        >
                                            <CheckCircle2 className="w-5 h-5" /> <span className="font-bold">Duyệt & Đã CK</span>
                                        </div>
                                        <div
                                            className={`border-2 rounded-xl p-3 cursor-pointer flex items-center justify-center gap-2 transition-all ${field.value === 'REJECT' ? 'border-red-500 bg-red-50 text-red-700' : 'border-border text-muted-foreground hover:bg-slate-50'}`}
                                            onClick={() => !isPending && form.setValue('action', 'REJECT')}
                                        >
                                            <XCircle className="w-5 h-5" /> <span className="font-bold">Từ chối (Hoàn tiền)</span>
                                        </div>
                                    </div>
                                </FormItem>
                            )}
                        />

                        {actionValue === 'REJECT' && (
                            <FormField
                                control={form.control}
                                name="rejectionReason"
                                render={({ field }) => (
                                    <FormItem className="animate-in fade-in slide-in-from-top-2">
                                        <FormLabel className="text-red-600 flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4" /> Lý do từ chối (Bắt buộc)
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Nhập lý do để thông báo qua Email cho Giáo viên..."
                                                className="resize-none"
                                                disabled={isPending}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <DialogFooter className="gap-2 sm:gap-0 pt-2">
                            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                                Hủy
                            </Button>
                            <Button
                                type="submit"
                                disabled={isPending}
                                className={`font-bold min-w-[120px] ${actionValue === 'APPROVE' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}
                            >
                                {isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                                {actionValue === 'APPROVE' ? 'Xác nhận Duyệt' : 'Xác nhận Từ chối'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}