'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { useTransactionConfirmStore } from '../stores/transaction-confirm.store';
import { withdrawSchema, WithdrawFormDTO } from '../types/billing.schema';
import { useWithdrawMutation } from '../hooks/useTeacherWallet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/shared/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { Loader2, ArrowRightLeft } from 'lucide-react';
import { toast } from 'sonner';

export function WithdrawModal() {
    const [open, setOpen] = useState(false);
    const balance = useAuthStore((state) => state.user?.balance ?? 0);
    const openConfirm = useTransactionConfirmStore((state) => state.openConfirm);

    const form = useForm<WithdrawFormDTO>({
        resolver: zodResolver(withdrawSchema),
        defaultValues: {
            amount: 100000,
            bankName: '',
            accountNumber: '',
            accountName: '',
        },
    });

    // Lấy mutateAsync để intercept API Call
    const { mutateAsync, isPending } = useWithdrawMutation(() => {
        setOpen(false);
        form.reset();
    });

    const onSubmit = (data: WithdrawFormDTO) => {
        // Validate logic nghiệp vụ sớm
        if (data.amount > balance) {
            toast.error('Số dư không đủ', { description: `Bạn chỉ có thể rút tối đa ${balance.toLocaleString()}đ` });
            form.setError('amount', { type: 'manual', message: 'Vượt quá số dư khả dụng' });
            return;
        }

        // Intercept: Hiện hộp thoại xác nhận tổng quát trước khi trừ tiền
        openConfirm({
            title: 'Xác nhận rút doanh thu',
            description: `Rút tiền về tài khoản ngân hàng: ${data.bankName} - ${data.accountNumber}`,
            actionType: 'WITHDRAW',
            amount: data.amount,
            currentBalance: balance,
            onConfirm: async () => {
                await mutateAsync(data).catch(() => {});
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    size="lg"
                    className="bg-white text-indigo-700 hover:bg-slate-100 font-bold px-8 shadow-sm rounded-full transition-transform active:scale-95"
                >
                    <ArrowRightLeft className="w-5 h-5 mr-2" /> Rút doanh thu
                </Button>
            </DialogTrigger>

            {/* Khóa onInteractOutside khi đang chờ API */}
            <DialogContent className="sm:max-w-md" onInteractOutside={(e) => { if (isPending) e.preventDefault(); }}>
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Yêu cầu rút tiền</DialogTitle>
                    <DialogDescription>
                        Vui lòng nhập thông tin ngân hàng thụ hưởng.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Số tiền rút (VNĐ)</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="Ví dụ: 500000" {...field} disabled={isPending} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="bankName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Ngân hàng</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ví dụ: Vietcombank" {...field} disabled={isPending} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="accountNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Số tài khoản</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Nhập số tài khoản" {...field} disabled={isPending} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="accountName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tên chủ tài khoản</FormLabel>
                                    <FormControl>
                                        <Input placeholder="NGUYEN VAN A" className="uppercase" {...field} disabled={isPending} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="pt-4 flex justify-end gap-3">
                            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
                                Hủy
                            </Button>
                            <Button type="submit" disabled={isPending} className="font-bold min-w-[120px] bg-indigo-600 hover:bg-indigo-700 text-white shadow-md">
                                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Tiếp tục'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}