import { PricingPlanCode } from '../types/subscription.schema';
import type { UserSession } from '@/features/auth/stores/auth.store';
export declare const PLAN_WEIGHTS: Record<PricingPlanCode, number>;
export declare const getPlanActionState: (planCode: PricingPlanCode, user: UserSession | null) => {
    isCurrentPlan: boolean;
    isDowngrade: boolean;
    canRenew: boolean;
    canUpgrade: boolean;
    isDisabled: boolean;
};
