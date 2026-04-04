"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useWithdrawMutation = void 0;
const react_query_1 = require("@tanstack/react-query");
const billing_service_1 = require("../api/billing.service");
const course_keys_1 = require("@/features/courses/api/course-keys");
const useBillingFlows_1 = require("./useBillingFlows");
const sonner_1 = require("sonner");
const error_parser_1 = require("@/shared/lib/error-parser");
const useWithdrawMutation = (onSuccessCallback) => {
    const queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: (payload) => billing_service_1.billingService.withdraw(payload),
        onSuccess: (data) => {
            sonner_1.toast.success('Đã gửi yêu cầu rút tiền', {
                description: data.message,
            });
            queryClient.invalidateQueries({ queryKey: course_keys_1.courseQueryKeys.walletBalance() });
            queryClient.invalidateQueries({ queryKey: useBillingFlows_1.WALLET_TRANSACTIONS_KEY });
            if (onSuccessCallback)
                onSuccessCallback();
        },
        onError: (error) => {
            const parsed = (0, error_parser_1.parseApiError)(error);
            sonner_1.toast.error('Rút tiền thất bại', { description: parsed.message });
        }
    });
};
exports.useWithdrawMutation = useWithdrawMutation;
//# sourceMappingURL=useTeacherWallet.js.map