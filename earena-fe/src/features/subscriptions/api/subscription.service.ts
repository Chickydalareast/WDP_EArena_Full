import { axiosClient } from '@/shared/lib/axios-client';
import { API_ENDPOINTS } from '@/config/api-endpoints';
import { IPricingPlan, UpgradeSubscriptionDTO, UpgradeSubscriptionResponse } from '../types/subscription.schema';

export const subscriptionService = {
    getPlans: async (): Promise<IPricingPlan[]> => {
        return axiosClient.get(API_ENDPOINTS.SUBSCRIPTIONS.PLANS);
    },

    upgradePlan: async (payload: UpgradeSubscriptionDTO): Promise<UpgradeSubscriptionResponse> => {
        return axiosClient.post(API_ENDPOINTS.SUBSCRIPTIONS.UPGRADE, payload);
    },
};