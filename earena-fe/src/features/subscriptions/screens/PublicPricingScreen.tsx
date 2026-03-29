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
        // Luồng 1: Chưa đăng nhập
        if (!user) {
            router.push(`${ROUTES.AUTH.LOGIN}?callbackUrl=${encodeURIComponent(ROUTES.PUBLIC.PRICING)}`);
            return;
        }

        // Luồng 2: Là Học sinh -> Cần nâng cấp làm Giáo viên
        if (user.role === 'STUDENT') {
            // [Zero Assumption]: Project hiện tại chưa có Route dành cho form đăng ký Giảng viên của Student.
            // Tạm thời bật Toast Info, khi nào có file/route sẽ thay bằng router.push()
            toast.info('Trở thành Giảng viên', {
                description: 'Vui lòng đăng ký tài khoản Teacher ở mục Đăng Ký',
                duration: 5000,
            });
            return;
        }

        // Luồng 3: Là Giáo viên -> Chuyển hướng vào Dashboard quản lý gói
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
        <div className="min-h-screen bg-slate-50 py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h1 className="text-4xl font-extrabold text-slate-900 sm:text-5xl">
                        Đầu tư cho chất lượng giảng dạy
                    </h1>
                    <p className="mt-4 text-xl text-slate-600">
                        Nền tảng EArena cung cấp công cụ mạnh mẽ giúp bạn xây dựng khóa học chuyên nghiệp, tiếp cận hàng triệu học viên toàn quốc.
                    </p>
                </div>

                {isError && (
                    <div className="text-center p-8 bg-red-50 text-red-600 rounded-2xl border border-red-200">
                        <p className="font-semibold">Không thể tải danh sách gói cước lúc này.</p>
                        <p className="text-sm mt-1">Vui lòng thử lại sau.</p>
                    </div>
                )}

                {/* Lưới hiển thị Bảng giá */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {isLoading || !isInitialized ? (
                        // Skeleton Chống FOUC
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
                                        className={`w-full h-12 font-bold text-base transition-all ${plan.code === PricingPlanCode.PRO
                                                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                                                : 'bg-slate-900 hover:bg-slate-800 text-white'
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