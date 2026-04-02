'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { usePricingPlans } from '../hooks/useSubscriptions';
import { PricingCard, PricingCardSkeleton } from '../components/PricingCard';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { Button } from '@/shared/components/ui/button';
import { ROUTES } from '@/config/routes';
import { PricingPlanCode } from '../types/subscription.schema';
import { toast } from 'sonner';

export function PublicPricingScreen() {
    const router = useRouter();
    const { data: plans, isLoading, isError } = usePricingPlans();
    const { user, isInitialized } = useAuthStore();

    const handleCtaClick = () => {
        if (!user) {
            router.push(`${ROUTES.AUTH.LOGIN}?callbackUrl=${encodeURIComponent(ROUTES.PUBLIC.PRICING)}`);
            return;
        }

        if (user.role === 'STUDENT') {
            toast.info('Trở thành Giảng viên', {
                description: 'Vui lòng đăng ký tài khoản Teacher ở mục Đăng Ký',
                duration: 5000,
            });
            return;
        }

        if (user.role === 'TEACHER') {
            router.push(ROUTES.TEACHER.SUBSCRIPTION);
            return;
        }
    };

    const getCtaText = () => {
        if (!user) return 'Bắt đầu ngay';
        if (user.role === 'STUDENT') return 'Trở thành Giáo viên';
        return 'Nâng cấp gói ngay';
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-background py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-[1400px] mx-auto">
                <div className="text-center max-w-3xl mx-auto mb-16 animate-in slide-in-from-bottom-4 fade-in duration-700">
                    <h1 className="text-4xl font-black text-foreground sm:text-5xl tracking-tight leading-tight">
                        Đầu tư cho chất lượng giảng dạy
                    </h1>
                    <p className="mt-4 text-xl text-muted-foreground font-medium">
                        Nền tảng EArena cung cấp công cụ mạnh mẽ giúp bạn xây dựng khóa học chuyên nghiệp, tiếp cận hàng triệu học viên toàn quốc.
                    </p>
                </div>

                {isError && (
                    <div className="text-center p-8 bg-destructive/10 text-destructive rounded-2xl border border-destructive/20 max-w-2xl mx-auto">
                        <p className="font-bold">Không thể tải danh sách gói cước lúc này.</p>
                        <p className="text-sm mt-1">Vui lòng thử lại sau.</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {isLoading || !isInitialized ? (
                        <>
                            <PricingCardSkeleton />
                            <PricingCardSkeleton />
                            <PricingCardSkeleton />
                        </>
                    ) : (
                        plans?.map((plan) => (
                            <PricingCard
                                key={plan._id}
                                plan={plan}
                                isPopular={plan.code === PricingPlanCode.PRO}
                                actionButton={
                                    <Button
                                        className={`w-full h-14 font-bold text-base rounded-xl transition-all shadow-md ${plan.code === PricingPlanCode.PRO
                                                ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20'
                                                : 'bg-foreground hover:bg-foreground/90 text-background'
                                            }`}
                                        onClick={handleCtaClick}
                                    >
                                        {getCtaText()}
                                    </Button>
                                }
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}