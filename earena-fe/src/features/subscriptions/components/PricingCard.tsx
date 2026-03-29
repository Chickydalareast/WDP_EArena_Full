import React, { ReactNode } from 'react';
import { IPricingPlan, PricingPlanCode } from '../types/subscription.schema';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { CheckCircle2, Crown, Sparkles, Star } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface PricingCardProps {
    plan: IPricingPlan;
    actionButton: ReactNode;
    isPopular?: boolean;
}

const PLAN_THEME: Record<PricingPlanCode, { icon: React.ElementType, colorClass: string, bgClass: string }> = {
    [PricingPlanCode.FREE]: { icon: Star, colorClass: 'text-slate-600', bgClass: 'bg-slate-100' },
    [PricingPlanCode.PRO]: { icon: Sparkles, colorClass: 'text-blue-600', bgClass: 'bg-blue-100' },
    [PricingPlanCode.ENTERPRISE]: { icon: Crown, colorClass: 'text-yellow-600', bgClass: 'bg-yellow-100' },
};

export function PricingCard({ plan, actionButton, isPopular = false }: PricingCardProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const theme = PLAN_THEME[plan.code] || PLAN_THEME[PricingPlanCode.FREE];
    const Icon = theme.icon;

    return (
        <Card className={cn(
            "relative flex flex-col h-full transition-all duration-300 hover:shadow-xl",
            isPopular ? "border-blue-500 shadow-lg scale-105 z-10" : "border-border"
        )}>
            {isPopular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm">
                    Phổ biến nhất
                </div>
            )}

            <CardHeader className="text-center pb-8 pt-8">
                <div className={cn("w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4", theme.bgClass)}>
                    <Icon className={cn("w-7 h-7", theme.colorClass)} />
                </div>
                <CardTitle className="text-2xl font-bold uppercase tracking-wider text-slate-800">
                    {plan.name}
                </CardTitle>
                <div className="mt-4 flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-extrabold text-slate-900">{formatCurrency(plan.priceMonthly)}</span>
                    <span className="text-sm font-medium text-slate-500">/tháng</span>
                </div>
            </CardHeader>

            <CardContent className="flex-1">
                <ul className="space-y-4">
                    {plan.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                            <span className="text-sm text-slate-700 leading-tight">{benefit}</span>
                        </li>
                    ))}
                </ul>
            </CardContent>

            <CardFooter className="pt-6 pb-8 px-6">
                {actionButton}
            </CardFooter>
        </Card>
    );
}

export function PricingCardSkeleton() {
    return (
        <Card className="flex flex-col h-full border-border">
            <CardHeader className="text-center pb-8 pt-8 space-y-4 items-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-200 animate-pulse" />
                <div className="w-24 h-6 bg-slate-200 rounded animate-pulse" />
                <div className="w-40 h-10 bg-slate-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-slate-200 animate-pulse shrink-0" />
                        <div className="h-4 bg-slate-200 rounded animate-pulse w-full" />
                    </div>
                ))}
            </CardContent>
            <CardFooter className="pt-6 pb-8 px-6">
                <div className="w-full h-12 bg-slate-200 rounded-lg animate-pulse" />
            </CardFooter>
        </Card>
    );
}