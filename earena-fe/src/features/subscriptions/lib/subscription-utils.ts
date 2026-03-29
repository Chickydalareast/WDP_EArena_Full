import { PricingPlanCode } from '../types/subscription.schema';
import type { UserSession } from '@/features/auth/stores/auth.store';

export const PLAN_WEIGHTS: Record<PricingPlanCode, number> = {
    [PricingPlanCode.FREE]: 0,
    [PricingPlanCode.PRO]: 1,
    [PricingPlanCode.ENTERPRISE]: 2,
};

export const getPlanActionState = (planCode: PricingPlanCode, user: UserSession | null) => {
    const isSubExpired = user?.subscription?.isExpired ?? true;
    const currentUserPlanCode = user?.subscription?.planCode || PricingPlanCode.FREE;
    const currentUserWeight = !isSubExpired ? PLAN_WEIGHTS[currentUserPlanCode] : 0;

    const targetWeight = PLAN_WEIGHTS[planCode];

    const isCurrentPlan = currentUserWeight === targetWeight && targetWeight > 0;

    const isDowngrade = targetWeight < currentUserWeight;

    const canRenew = isCurrentPlan && !isSubExpired;

    const canUpgrade = targetWeight > currentUserWeight;

    return {
        isCurrentPlan,
        isDowngrade,
        canRenew,
        canUpgrade,
        isDisabled: isDowngrade || (targetWeight === 0 && currentUserWeight > 0)
    };
};