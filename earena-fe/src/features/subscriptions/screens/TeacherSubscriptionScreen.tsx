'use client';

import React, { useState } from 'react';
import { usePricingPlans } from '../hooks/useSubscriptions';
import { getPlanActionState } from '../lib/subscription-utils';
import { PricingCard, PricingCardSkeleton } from '../components/PricingCard';
import { UpgradeConfirmModal } from '../components/UpgradeConfirmModal';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { Button } from '@/shared/components/ui/button';
import { IPricingPlan } from '../types/subscription.schema';
import { Crown, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export function TeacherSubscriptionScreen() {
    const { data: plans, isLoading } = usePricingPlans();
    const { user, isInitialized } = useAuthStore();

    const [selectedPlan, setSelectedPlan] = useState<IPricingPlan | null>(null);

    if (!isInitialized) return null;

    const currentSub = user?.subscription;
    const isExpired = currentSub?.isExpired ?? true;
    const hasPlan = !!currentSub && currentSub.planCode !== 'FREE';

    const formatExpiryDate = (isoString?: string | null) => {
        if (!isoString) return 'Vô thời hạn';
        return new Date(isoString).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    return (
        <div className="max-w-6xl mx-auto py-8 px-4 space-y-8 animate-in fade-in duration-500">

            <div className={cn(
                "rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm border",
                !hasPlan ? "bg-slate-50 border-border" :
                    isExpired ? "bg-red-50 border-red-200" : "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200"
            )}>
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "p-4 rounded-full flex items-center justify-center",
                        !hasPlan ? "bg-slate-200 text-slate-600" :
                            isExpired ? "bg-red-200 text-red-600" : "bg-blue-200 text-blue-600"
                    )}>
                        <Crown className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-1">
                            Gói cước hiện tại
                        </p>
                        <div className="flex items-center gap-3">
                            <h2 className={cn(
                                "text-3xl font-extrabold",
                                !hasPlan ? "text-slate-700" : isExpired ? "text-red-700" : "text-blue-700"
                            )}>
                                {currentSub?.planCode || 'FREE'}
                            </h2>

                            {hasPlan && (
                                <span className={cn(
                                    "px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5",
                                    isExpired ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                                )}>
                                    {isExpired ? <AlertTriangle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                                    {isExpired ? 'Đã hết hạn' : 'Đang kích hoạt'}
                                </span>
                            )}
                        </div>
                        {hasPlan && (
                            <p className="text-sm mt-2 flex items-center gap-1.5 text-muted-foreground">
                                <Clock className="w-4 h-4" /> Ngày hết hạn: <strong className="text-foreground">{formatExpiryDate(currentSub?.expiresAt)}</strong>
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="pt-4">
                <h3 className="text-2xl font-bold text-foreground mb-6">Tùy chọn Nâng cấp & Gia hạn</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {isLoading ? (
                        <>
                            <PricingCardSkeleton />
                            <PricingCardSkeleton />
                            <PricingCardSkeleton />
                        </>
                    ) : (
                        plans?.map((plan) => {
                            const actionState = getPlanActionState(plan.code, user);

                            return (
                                <PricingCard
                                    key={plan._id}
                                    plan={plan}
                                    isPopular={plan.code === 'PRO'}
                                    actionButton={
                                        <Button
                                            disabled={actionState.isDisabled}
                                            onClick={() => setSelectedPlan(plan)}
                                            className={cn(
                                                "w-full h-12 font-bold text-base transition-all",
                                                actionState.isDisabled ? "bg-slate-100 text-slate-400" :
                                                    actionState.canRenew ? "bg-green-600 hover:bg-green-700 text-white shadow-md" :
                                                        plan.code === 'PRO' ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md" :
                                                            "bg-slate-900 hover:bg-slate-800 text-white"
                                            )}
                                        >
                                            {actionState.isDisabled ? 'Không khả dụng' :
                                                actionState.canRenew ? 'Gia hạn gói' :
                                                    actionState.canUpgrade ? 'Nâng cấp ngay' : 'Đăng ký ngay'}
                                        </Button>
                                    }
                                />
                            );
                        })
                    )}
                </div>
            </div>

            <UpgradeConfirmModal plan={selectedPlan} onClose={() => setSelectedPlan(null)} />
        </div>
    );
}