"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PricingCard = PricingCard;
exports.PricingCardSkeleton = PricingCardSkeleton;
const react_1 = __importDefault(require("react"));
const subscription_schema_1 = require("../types/subscription.schema");
const card_1 = require("@/shared/components/ui/card");
const lucide_react_1 = require("lucide-react");
const utils_1 = require("@/shared/lib/utils");
const PLAN_THEME = {
    [subscription_schema_1.PricingPlanCode.FREE]: { icon: lucide_react_1.Star, colorClass: 'text-foreground', bgClass: 'bg-secondary' },
    [subscription_schema_1.PricingPlanCode.PRO]: { icon: lucide_react_1.Sparkles, colorClass: 'text-primary', bgClass: 'bg-primary/10' },
    [subscription_schema_1.PricingPlanCode.ENTERPRISE]: { icon: lucide_react_1.Crown, colorClass: 'text-background', bgClass: 'bg-foreground' },
};
function PricingCard({ plan, actionButton, isPopular = false }) {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };
    const theme = PLAN_THEME[plan.code] || PLAN_THEME[subscription_schema_1.PricingPlanCode.FREE];
    const Icon = theme.icon;
    return (<card_1.Card className={(0, utils_1.cn)("relative flex flex-col h-full transition-all duration-300 hover:shadow-xl rounded-3xl overflow-hidden", isPopular ? "border-primary shadow-lg shadow-primary/10 scale-105 z-10" : "border-border/60")}>
            {isPopular && (<div className="absolute top-0 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1.5 rounded-b-xl text-[10px] font-black uppercase tracking-widest shadow-sm">
                    Phổ biến nhất
                </div>)}

            <card_1.CardHeader className="text-center pb-6 pt-10">
                <div className={(0, utils_1.cn)("w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 transition-transform hover:scale-110", theme.bgClass)}>
                    <Icon className={(0, utils_1.cn)("w-8 h-8", theme.colorClass)}/>
                </div>
                <card_1.CardTitle className="text-2xl font-black uppercase tracking-widest text-foreground">
                    {plan.name}
                </card_1.CardTitle>
                <div className="mt-4 flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-black tracking-tight text-foreground">{formatCurrency(plan.priceMonthly)}</span>
                    <span className="text-sm font-bold text-muted-foreground">/tháng</span>
                </div>
            </card_1.CardHeader>

            <card_1.CardContent className="flex-1 px-8">
                <ul className="space-y-4">
                    {plan.benefits.map((benefit, idx) => (<li key={idx} className="flex items-start gap-3">
                            <lucide_react_1.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5"/>
                            <span className="text-sm text-foreground font-medium leading-tight">{benefit}</span>
                        </li>))}
                </ul>
            </card_1.CardContent>

            <card_1.CardFooter className="pt-6 pb-8 px-8">
                {actionButton}
            </card_1.CardFooter>
        </card_1.Card>);
}
function PricingCardSkeleton() {
    return (<card_1.Card className="flex flex-col h-full border-border/60 rounded-3xl">
            <card_1.CardHeader className="text-center pb-8 pt-10 space-y-4 items-center">
                <div className="w-16 h-16 rounded-2xl bg-secondary animate-pulse"/>
                <div className="w-24 h-6 bg-secondary rounded animate-pulse"/>
                <div className="w-40 h-10 bg-secondary rounded animate-pulse"/>
            </card_1.CardHeader>
            <card_1.CardContent className="flex-1 space-y-4 px-8">
                {[1, 2, 3, 4].map((i) => (<div key={i} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-secondary animate-pulse shrink-0"/>
                        <div className="h-4 bg-secondary rounded animate-pulse w-full"/>
                    </div>))}
            </card_1.CardContent>
            <card_1.CardFooter className="pt-6 pb-8 px-8">
                <div className="w-full h-14 bg-secondary rounded-xl animate-pulse"/>
            </card_1.CardFooter>
        </card_1.Card>);
}
//# sourceMappingURL=PricingCard.js.map