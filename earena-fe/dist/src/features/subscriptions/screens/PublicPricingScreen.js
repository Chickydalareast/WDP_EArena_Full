'use client';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicPricingScreen = PublicPricingScreen;
const react_1 = __importDefault(require("react"));
const navigation_1 = require("next/navigation");
const useSubscriptions_1 = require("../hooks/useSubscriptions");
const PricingCard_1 = require("../components/PricingCard");
const auth_store_1 = require("@/features/auth/stores/auth.store");
const button_1 = require("@/shared/components/ui/button");
const routes_1 = require("@/config/routes");
const subscription_schema_1 = require("../types/subscription.schema");
const sonner_1 = require("sonner");
function PublicPricingScreen() {
    const router = (0, navigation_1.useRouter)();
    const { data: plans, isLoading, isError } = (0, useSubscriptions_1.usePricingPlans)();
    const { user, isInitialized } = (0, auth_store_1.useAuthStore)();
    const handleCtaClick = () => {
        if (!user) {
            router.push(`${routes_1.ROUTES.AUTH.LOGIN}?callbackUrl=${encodeURIComponent(routes_1.ROUTES.PUBLIC.PRICING)}`);
            return;
        }
        if (user.role === 'STUDENT') {
            sonner_1.toast.info('Trở thành Giảng viên', {
                description: 'Vui lòng đăng ký tài khoản Teacher ở mục Đăng Ký',
                duration: 5000,
            });
            return;
        }
        if (user.role === 'TEACHER') {
            router.push(routes_1.ROUTES.TEACHER.SUBSCRIPTION);
            return;
        }
    };
    const getCtaText = () => {
        if (!user)
            return 'Bắt đầu ngay';
        if (user.role === 'STUDENT')
            return 'Trở thành Giáo viên';
        return 'Nâng cấp gói ngay';
    };
    return (<div className="min-h-[calc(100vh-4rem)] bg-background py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-[1400px] mx-auto">
                <div className="text-center max-w-3xl mx-auto mb-16 animate-in slide-in-from-bottom-4 fade-in duration-700">
                    <h1 className="text-4xl font-black text-foreground sm:text-5xl tracking-tight leading-tight">
                        Đầu tư cho chất lượng giảng dạy
                    </h1>
                    <p className="mt-4 text-xl text-muted-foreground font-medium">
                        Nền tảng EArena cung cấp công cụ mạnh mẽ giúp bạn xây dựng khóa học chuyên nghiệp, tiếp cận hàng triệu học viên toàn quốc.
                    </p>
                </div>

                {isError && (<div className="text-center p-8 bg-destructive/10 text-destructive rounded-2xl border border-destructive/20 max-w-2xl mx-auto">
                        <p className="font-bold">Không thể tải danh sách gói cước lúc này.</p>
                        <p className="text-sm mt-1">Vui lòng thử lại sau.</p>
                    </div>)}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {isLoading || !isInitialized ? (<>
                            <PricingCard_1.PricingCardSkeleton />
                            <PricingCard_1.PricingCardSkeleton />
                            <PricingCard_1.PricingCardSkeleton />
                        </>) : (plans?.map((plan) => (<PricingCard_1.PricingCard key={plan._id} plan={plan} isPopular={plan.code === subscription_schema_1.PricingPlanCode.PRO} actionButton={<button_1.Button className={`w-full h-14 font-bold text-base rounded-xl transition-all shadow-md ${plan.code === subscription_schema_1.PricingPlanCode.PRO
                    ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20'
                    : 'bg-foreground hover:bg-foreground/90 text-background'}`} onClick={handleCtaClick}>
                                        {getCtaText()}
                                    </button_1.Button>}/>)))}
                </div>
            </div>
        </div>);
}
//# sourceMappingURL=PublicPricingScreen.js.map