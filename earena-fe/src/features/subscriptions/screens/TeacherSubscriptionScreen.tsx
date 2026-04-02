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
        <div className="max-w-[1400px] mx-auto py-8 px-4 md:px-6 space-y-10 animate-in fade-in duration-500">

            {/* BENTO HERO CARD: Current Plan Status */}
            <div className={cn(
                "rounded-[2rem] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm relative overflow-hidden",
                !hasPlan ? "bg-card border border-border" :
                    isExpired ? "bg-destructive/10 border border-destructive/20" : "bg-primary border border-primary/20 text-primary-foreground"
            )}>
                {hasPlan && !isExpired && (
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />
                )}
                
                <div className="relative z-10 flex items-center gap-6">
                    <div className={cn(
                        "p-5 rounded-3xl flex items-center justify-center shrink-0 shadow-inner",
                        !hasPlan ? "bg-secondary text-muted-foreground" :
                            isExpired ? "bg-destructive/20 text-destructive" : "bg-background/20 backdrop-blur-md text-white"
                    )}>
                        <Crown className="w-10 h-10" />
                    </div>
                    <div>
                        <p className={cn(
                            "text-sm font-bold uppercase tracking-widest mb-1.5",
                            !hasPlan || isExpired ? "text-muted-foreground" : "text-primary-foreground/80"
                        )}>
                            Gói cước hiện tại
                        </p>
                        <div className="flex items-center gap-3">
                            <h2 className={cn(
                                "text-4xl md:text-5xl font-black tracking-tight drop-shadow-sm",
                                !hasPlan ? "text-foreground" : isExpired ? "text-destructive" : "text-white"
                            )}>
                                {currentSub?.planCode || 'FREE'}
                            </h2>

                            {hasPlan && (
                                <span className={cn(
                                    "px-3 py-1.5 rounded-full text-[10px] font-black flex items-center gap-1.5 uppercase tracking-wider shadow-sm",
                                    isExpired ? "bg-destructive text-destructive-foreground" : "bg-background/90 text-primary backdrop-blur-sm"
                                )}>
                                    {isExpired ? <AlertTriangle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                                    {isExpired ? 'Đã hết hạn' : 'Đang kích hoạt'}
                                </span>
                            )}
                        </div>
                        {hasPlan && (
                            <p className={cn(
                                "text-sm mt-3 flex items-center gap-1.5 font-medium",
                                isExpired ? "text-destructive/80" : "text-primary-foreground/90"
                            )}>
                                <Clock className="w-4 h-4" /> Ngày hết hạn: <strong className={isExpired ? "text-destructive" : "text-white"}>{formatExpiryDate(currentSub?.expiresAt)}</strong>
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* PRICING GRID */}
            <div className="pt-4">
                <h3 className="text-2xl md:text-3xl font-black text-foreground mb-8 tracking-tight">Tùy chọn Nâng cấp & Gia hạn</h3>

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
                                                "w-full h-14 font-bold text-base rounded-xl transition-all shadow-md",
                                                actionState.isDisabled ? "bg-secondary text-muted-foreground shadow-none" :
                                                    actionState.canRenew ? "bg-green-600 hover:bg-green-700 text-white" :
                                                        plan.code === 'PRO' ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20" :
                                                            "bg-foreground hover:bg-foreground/90 text-background"
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