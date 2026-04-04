"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlanActionState = exports.PLAN_WEIGHTS = void 0;
const subscription_schema_1 = require("../types/subscription.schema");
exports.PLAN_WEIGHTS = {
    [subscription_schema_1.PricingPlanCode.FREE]: 0,
    [subscription_schema_1.PricingPlanCode.PRO]: 1,
    [subscription_schema_1.PricingPlanCode.ENTERPRISE]: 2,
};
const getPlanActionState = (planCode, user) => {
    const isSubExpired = user?.subscription?.isExpired ?? true;
    const currentUserPlanCode = user?.subscription?.planCode || subscription_schema_1.PricingPlanCode.FREE;
    const currentUserWeight = !isSubExpired ? exports.PLAN_WEIGHTS[currentUserPlanCode] : 0;
    const targetWeight = exports.PLAN_WEIGHTS[planCode];
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
exports.getPlanActionState = getPlanActionState;
//# sourceMappingURL=subscription-utils.js.map