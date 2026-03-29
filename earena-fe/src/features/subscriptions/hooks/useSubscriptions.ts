import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionService } from '../api/subscription.service';
import { subscriptionQueryKeys } from '../api/subscription-keys';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { useBillingUIStore } from '@/features/billing/stores/billing-ui.store';
import { courseQueryKeys } from '@/features/courses/api/course-keys';
import { WALLET_TRANSACTIONS_KEY } from '@/features/billing/hooks/useBillingFlows';
import { IPricingPlan, UpgradeSubscriptionDTO } from '../types/subscription.schema';
import { toast } from 'sonner';
import { parseApiError } from '@/shared/lib/error-parser';
import { authKeys } from '@/features/auth/api/auth.service';


export const usePricingPlans = () => {
    return useQuery({
        queryKey: subscriptionQueryKeys.plans(),
        queryFn: subscriptionService.getPlans,
        staleTime: 1000 * 60 * 10,
    });
};

export const useUpgradePlan = (onSuccessCallback?: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: UpgradeSubscriptionDTO) => subscriptionService.upgradePlan(payload),

        onSuccess: (response, variables) => {
            const cachedPlans = queryClient.getQueryData<IPricingPlan[]>(subscriptionQueryKeys.plans());
            const selectedPlan = cachedPlans?.find(p => p._id === variables.planId);

            if (selectedPlan) {
                useAuthStore.getState().updateUserSubscription({
                    planId: variables.planId,
                    planCode: selectedPlan.code,
                    expiresAt: response.expiresAt,
                });
            }

            queryClient.invalidateQueries({ queryKey: courseQueryKeys.walletBalance() });
            queryClient.invalidateQueries({ queryKey: WALLET_TRANSACTIONS_KEY });

            queryClient.invalidateQueries({ queryKey: authKeys.session() });

            toast.success('Giao dịch thành công', { description: response.message });

            if (onSuccessCallback) onSuccessCallback();
        },

        onError: (error) => {
            const parsed = parseApiError(error);

            if (parsed.statusCode === 400 && parsed.message.toLowerCase().includes('số dư')) {
                toast.error('Giao dịch bị từ chối', { description: parsed.message });
                useBillingUIStore.getState().openDepositModal();
                return;
            }

            if (parsed.statusCode === 404) {
                toast.error('Gói cước không khả dụng', { description: parsed.message });
                queryClient.invalidateQueries({ queryKey: subscriptionQueryKeys.plans() });
                return;
            }

            toast.error('Không thể nâng cấp', { description: parsed.message });
        }
    });
};