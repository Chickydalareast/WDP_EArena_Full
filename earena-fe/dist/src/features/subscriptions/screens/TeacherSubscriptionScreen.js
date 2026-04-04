'use client';
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeacherSubscriptionScreen = TeacherSubscriptionScreen;
const react_1 = __importStar(require("react"));
const useSubscriptions_1 = require("../hooks/useSubscriptions");
const subscription_utils_1 = require("../lib/subscription-utils");
const PricingCard_1 = require("../components/PricingCard");
const UpgradeConfirmModal_1 = require("../components/UpgradeConfirmModal");
const auth_store_1 = require("@/features/auth/stores/auth.store");
const button_1 = require("@/shared/components/ui/button");
const lucide_react_1 = require("lucide-react");
const utils_1 = require("@/shared/lib/utils");
function TeacherSubscriptionScreen() {
    const { data: plans, isLoading } = (0, useSubscriptions_1.usePricingPlans)();
    const { user, isInitialized } = (0, auth_store_1.useAuthStore)();
    const [selectedPlan, setSelectedPlan] = (0, react_1.useState)(null);
    if (!isInitialized)
        return null;
    const currentSub = user?.subscription;
    const isExpired = currentSub?.isExpired ?? true;
    const hasPlan = !!currentSub && currentSub.planCode !== 'FREE';
    const formatExpiryDate = (isoString) => {
        if (!isoString)
            return 'Vô thời hạn';
        return new Date(isoString).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };
    return (<div className="max-w-[1400px] mx-auto py-8 px-4 md:px-6 space-y-10 animate-in fade-in duration-500">

            
            <div className={(0, utils_1.cn)("rounded-[2rem] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm relative overflow-hidden", !hasPlan ? "bg-card border border-border" :
            isExpired ? "bg-destructive/10 border border-destructive/20" : "bg-primary border border-primary/20 text-primary-foreground")}>
                {hasPlan && !isExpired && (<div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none"/>)}
                
                <div className="relative z-10 flex items-center gap-6">
                    <div className={(0, utils_1.cn)("p-5 rounded-3xl flex items-center justify-center shrink-0 shadow-inner", !hasPlan ? "bg-secondary text-muted-foreground" :
            isExpired ? "bg-destructive/20 text-destructive" : "bg-background/20 backdrop-blur-md text-white")}>
                        <lucide_react_1.Crown className="w-10 h-10"/>
                    </div>
                    <div>
                        <p className={(0, utils_1.cn)("text-sm font-bold uppercase tracking-widest mb-1.5", !hasPlan || isExpired ? "text-muted-foreground" : "text-primary-foreground/80")}>
                            Gói cước hiện tại
                        </p>
                        <div className="flex items-center gap-3">
                            <h2 className={(0, utils_1.cn)("text-4xl md:text-5xl font-black tracking-tight drop-shadow-sm", !hasPlan ? "text-foreground" : isExpired ? "text-destructive" : "text-white")}>
                                {currentSub?.planCode || 'FREE'}
                            </h2>

                            {hasPlan && (<span className={(0, utils_1.cn)("px-3 py-1.5 rounded-full text-[10px] font-black flex items-center gap-1.5 uppercase tracking-wider shadow-sm", isExpired ? "bg-destructive text-destructive-foreground" : "bg-background/90 text-primary backdrop-blur-sm")}>
                                    {isExpired ? <lucide_react_1.AlertTriangle className="w-3.5 h-3.5"/> : <lucide_react_1.CheckCircle2 className="w-3.5 h-3.5"/>}
                                    {isExpired ? 'Đã hết hạn' : 'Đang kích hoạt'}
                                </span>)}
                        </div>
                        {hasPlan && (<p className={(0, utils_1.cn)("text-sm mt-3 flex items-center gap-1.5 font-medium", isExpired ? "text-destructive/80" : "text-primary-foreground/90")}>
                                <lucide_react_1.Clock className="w-4 h-4"/> Ngày hết hạn: <strong className={isExpired ? "text-destructive" : "text-white"}>{formatExpiryDate(currentSub?.expiresAt)}</strong>
                            </p>)}
                    </div>
                </div>
            </div>

            
            <div className="pt-4">
                <h3 className="text-2xl md:text-3xl font-black text-foreground mb-8 tracking-tight">Tùy chọn Nâng cấp & Gia hạn</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {isLoading ? (<>
                            <PricingCard_1.PricingCardSkeleton />
                            <PricingCard_1.PricingCardSkeleton />
                            <PricingCard_1.PricingCardSkeleton />
                        </>) : (plans?.map((plan) => {
            const actionState = (0, subscription_utils_1.getPlanActionState)(plan.code, user);
            return (<PricingCard_1.PricingCard key={plan._id} plan={plan} isPopular={plan.code === 'PRO'} actionButton={<button_1.Button disabled={actionState.isDisabled} onClick={() => setSelectedPlan(plan)} className={(0, utils_1.cn)("w-full h-14 font-bold text-base rounded-xl transition-all shadow-md", actionState.isDisabled ? "bg-secondary text-muted-foreground shadow-none" :
                        actionState.canRenew ? "bg-green-600 hover:bg-green-700 text-white" :
                            plan.code === 'PRO' ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20" :
                                "bg-foreground hover:bg-foreground/90 text-background")}>
                                            {actionState.isDisabled ? 'Không khả dụng' :
                        actionState.canRenew ? 'Gia hạn gói' :
                            actionState.canUpgrade ? 'Nâng cấp ngay' : 'Đăng ký ngay'}
                                        </button_1.Button>}/>);
        }))}
                </div>
            </div>

            <UpgradeConfirmModal_1.UpgradeConfirmModal plan={selectedPlan} onClose={() => setSelectedPlan(null)}/>
        </div>);
}
//# sourceMappingURL=TeacherSubscriptionScreen.js.map