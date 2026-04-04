'use client';

import React, { useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { rhfZodResolver as zodResolver } from '@/shared/lib/rhf-zod-resolver';
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
        resolver: zodResolver(withdrawSchema) as Resolver<WithdrawFormDTO>,
        defaultValues: {
            amount: 100000,
            bankName: '',
            accountNumber: '',
            accountName: '',
        },
    });

    const { mutateAsync, isPending } = useWithdrawMutation(() => {
        setOpen(false);
        form.reset();
    });

    const onSubmit = (data: WithdrawFormDTO) => {
        if (data.amount > balance) {
            toast.error('Số dư không đủ', { description: `Bạn chỉ có thể rút tối đa ${balance.toLocaleString()}đ` });
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
                await mutateAsync(data).catch(() => {});
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    size="lg"
                    variant="outline"
                    className="w-full text-foreground border-border hover:bg-secondary font-bold h-14 rounded-xl shadow-sm transition-transform active:scale-95 text-base"
                >
                    <ArrowRightLeft className="w-5 h-5 mr-2" /> Rút doanh thu
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md" onInteractOutside={(e) => { if (isPending) e.preventDefault(); }}>
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <ArrowRightLeft className="w-6 h-6 text-primary" />
                        Yêu cầu rút tiền
                    </DialogTitle>
                    <DialogDescription>
                        Vui lòng nhập thông tin ngân hàng thụ hưởng.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-bold">Số tiền rút (VNĐ)</FormLabel>
                                    <FormControl>
                                        <Input type="number" className="rounded-xl h-11" placeholder="Ví dụ: 500000" {...field} disabled={isPending} />
                                    </FormControl>
                                    <FormMessage className="font-bold" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="bankName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-bold">Ngân hàng</FormLabel>
                                    <FormControl>
                                        <Input className="rounded-xl h-11" placeholder="Ví dụ: Vietcombank" {...field} disabled={isPending} />
                                    </FormControl>
                                    <FormMessage className="font-bold" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="accountNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-bold">Số tài khoản</FormLabel>
                                    <FormControl>
                                        <Input className="rounded-xl h-11" placeholder="Nhập số tài khoản" {...field} disabled={isPending} />
                                    </FormControl>
                                    <FormMessage className="font-bold" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="accountName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-bold">Tên chủ tài khoản</FormLabel>
                                    <FormControl>
                                        <Input placeholder="NGUYEN VAN A" className="uppercase rounded-xl h-11" {...field} disabled={isPending} />
                                    </FormControl>
                                    <FormMessage className="font-bold" />
                                </FormItem>
                            )}
                        />

                        <div className="pt-6 border-t border-border flex justify-end gap-3">
                            <Button type="button" variant="outline" className="rounded-xl font-bold" onClick={() => setOpen(false)} disabled={isPending}>
                                Hủy
                            </Button>
                            <Button type="submit" disabled={isPending} className="font-bold rounded-xl min-w-[120px] bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
                                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Tiếp tục'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}