'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { IPricingPlan, upgradeSubscriptionSchema, UpgradeSubscriptionDTO } from '../types/subscription.schema';
import { useUpgradePlan } from '../hooks/useSubscriptions';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/shared/components/ui/dialog';
import { Form, FormField, FormItem, FormControl, FormMessage } from '@/shared/components/ui/form';
import { Button } from '@/shared/components/ui/button';
import { Loader2, AlertCircle, Calendar, CreditCard } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface UpgradeConfirmModalProps {
    plan: IPricingPlan | null;
    onClose: () => void;
}

export function UpgradeConfirmModal({ plan, onClose }: UpgradeConfirmModalProps) {
    const isOpen = !!plan;

    const { mutate: upgradePlan, isPending } = useUpgradePlan(() => {
        onClose();
    });

    const form = useForm<UpgradeSubscriptionDTO>({
        resolver: zodResolver(upgradeSubscriptionSchema),
        defaultValues: {
            planId: '',
            billingCycle: 'MONTHLY',
        },
    });

    useEffect(() => {
        if (plan) {
            form.reset({ planId: plan._id, billingCycle: 'MONTHLY' });
        }
    }, [plan, form]);

    const billingCycle = form.watch('billingCycle');

    if (!plan) return null;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const onSubmit = (data: UpgradeSubscriptionDTO) => {
        upgradePlan(data);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && !isPending && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black flex items-center gap-2 text-foreground">
                        <CreditCard className="w-7 h-7 text-primary" /> Xác nhận thanh toán
                    </DialogTitle>
                    <DialogDescription className="pt-2 font-medium">
                        Bạn đang chọn gói <span className="font-bold text-foreground uppercase tracking-widest bg-secondary px-2 py-0.5 rounded">{plan.name}</span>. Vui lòng chọn chu kỳ thanh toán.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
                        <FormField
                            control={form.control}
                            name="billingCycle"
                            render={() => (
                                <FormItem>
                                    <FormControl>
                                        <div className="grid grid-cols-2 gap-4">
                                            {/* Lựa chọn theo Tháng */}
                                            <div
                                                onClick={() => !isPending && form.setValue('billingCycle', 'MONTHLY')}
                                                className={cn(
                                                    "cursor-pointer rounded-2xl border-2 p-5 flex flex-col items-center justify-center gap-2 transition-all",
                                                    billingCycle === 'MONTHLY'
                                                        ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                                                        : "border-border hover:bg-secondary/50 text-muted-foreground"
                                                )}
                                            >
                                                <Calendar className={cn("w-6 h-6", billingCycle === 'MONTHLY' && "text-primary")} />
                                                <div className="text-sm font-bold">Gói 1 Tháng</div>
                                                <div className={cn("text-xl font-black", billingCycle === 'MONTHLY' && "text-primary")}>
                                                    {formatCurrency(plan.priceMonthly)}
                                                </div>
                                            </div>

                                            {/* Lựa chọn theo Năm (Kèm Tag tiết kiệm) */}
                                            <div
                                                onClick={() => !isPending && form.setValue('billingCycle', 'YEARLY')}
                                                className={cn(
                                                    "relative cursor-pointer rounded-2xl border-2 p-5 flex flex-col items-center justify-center gap-2 transition-all",
                                                    billingCycle === 'YEARLY'
                                                        ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                                                        : "border-border hover:bg-secondary/50 text-muted-foreground"
                                                )}
                                            >
                                                <div className="absolute -top-3 bg-green-500 dark:bg-green-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-sm tracking-wider border border-green-400">
                                                    TIẾT KIỆM 20%
                                                </div>
                                                <Calendar className={cn("w-6 h-6", billingCycle === 'YEARLY' && "text-primary")} />
                                                <div className="text-sm font-bold">Gói 1 Năm</div>
                                                <div className={cn("text-xl font-black", billingCycle === 'YEARLY' && "text-primary")}>
                                                    {formatCurrency(plan.priceYearly)}
                                                </div>
                                            </div>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Cảnh báo UX về Proration */}
                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 text-amber-700 dark:text-amber-500 text-xs font-medium p-4 rounded-xl flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p>Hệ thống sẽ tự động tính toán <strong>khấu trừ (nếu có)</strong> dựa trên số ngày còn lại của gói cước hiện tại. Số tiền bị trừ trong ví có thể thấp hơn mức giá hiển thị.</p>
                        </div>

                        <DialogFooter className="gap-3 sm:gap-0 pt-2 border-t border-border">
                            <Button type="button" variant="outline" className="rounded-xl font-bold h-11" onClick={onClose} disabled={isPending}>
                                Hủy bỏ
                            </Button>
                            <Button type="submit" disabled={isPending} className="font-bold min-w-[140px] rounded-xl h-11 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
                                {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                {isPending ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}