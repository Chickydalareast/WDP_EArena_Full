"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useUpgradePlan = exports.usePricingPlans = void 0;
const react_query_1 = require("@tanstack/react-query");
const subscription_service_1 = require("../api/subscription.service");
const subscription_keys_1 = require("../api/subscription-keys");
const auth_store_1 = require("@/features/auth/stores/auth.store");
const billing_ui_store_1 = require("@/features/billing/stores/billing-ui.store");
const course_keys_1 = require("@/features/courses/api/course-keys");
const useBillingFlows_1 = require("@/features/billing/hooks/useBillingFlows");
const sonner_1 = require("sonner");
const error_parser_1 = require("@/shared/lib/error-parser");
const auth_service_1 = require("@/features/auth/api/auth.service");
const usePricingPlans = () => {
    return (0, react_query_1.useQuery)({
        queryKey: subscription_keys_1.subscriptionQueryKeys.plans(),
        queryFn: subscription_service_1.subscriptionService.getPlans,
        staleTime: 1000 * 60 * 10,
    });
};
exports.usePricingPlans = usePricingPlans;
const useUpgradePlan = (onSuccessCallback) => {
    const queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: (payload) => subscription_service_1.subscriptionService.upgradePlan(payload),
        onSuccess: (response, variables) => {
            const cachedPlans = queryClient.getQueryData(subscription_keys_1.subscriptionQueryKeys.plans());
            const selectedPlan = cachedPlans?.find(p => p._id === variables.planId);
            if (selectedPlan) {
                auth_store_1.useAuthStore.getState().updateUserSubscription({
                    planId: variables.planId,
                    planCode: selectedPlan.code,
                    expiresAt: response.expiresAt,
                });
            }
            queryClient.invalidateQueries({ queryKey: course_keys_1.courseQueryKeys.walletBalance() });
            queryClient.invalidateQueries({ queryKey: useBillingFlows_1.WALLET_TRANSACTIONS_KEY });
            queryClient.invalidateQueries({ queryKey: auth_service_1.authKeys.session() });
            sonner_1.toast.success('Giao dịch thành công', { description: response.message });
            if (onSuccessCallback)
                onSuccessCallback();
        },
        onError: (error) => {
            const parsed = (0, error_parser_1.parseApiError)(error);
            if (parsed.statusCode === 400 && parsed.message.toLowerCase().includes('số dư')) {
                sonner_1.toast.error('Giao dịch bị từ chối', { description: parsed.message });
                billing_ui_store_1.useBillingUIStore.getState().openDepositModal();
                return;
            }
            if (parsed.statusCode === 404) {
                sonner_1.toast.error('Gói cước không khả dụng', { description: parsed.message });
                queryClient.invalidateQueries({ queryKey: subscription_keys_1.subscriptionQueryKeys.plans() });
                return;
            }
            sonner_1.toast.error('Không thể nâng cấp', { description: parsed.message });
        }
    });
};
exports.useUpgradePlan = useUpgradePlan;
//# sourceMappingURL=useSubscriptions.js.map