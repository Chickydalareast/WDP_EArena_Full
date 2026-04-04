import { IPricingPlan, UpgradeSubscriptionDTO, UpgradeSubscriptionResponse } from '../types/subscription.schema';
export declare const subscriptionService: {
    getPlans: () => Promise<IPricingPlan[]>;
    upgradePlan: (payload: UpgradeSubscriptionDTO) => Promise<UpgradeSubscriptionResponse>;
};
