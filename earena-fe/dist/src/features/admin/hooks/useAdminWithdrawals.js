"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useProcessWithdrawal = exports.useAdminWithdrawals = exports.ADMIN_WITHDRAWALS_KEY = void 0;
const react_query_1 = require("@tanstack/react-query");
const admin_wallet_service_1 = require("../api/admin-wallet.service");
const sonner_1 = require("sonner");
const error_parser_1 = require("@/shared/lib/error-parser");
exports.ADMIN_WITHDRAWALS_KEY = ['admin', 'withdrawals'];
const useAdminWithdrawals = (params) => {
    return (0, react_query_1.useQuery)({
        queryKey: [...exports.ADMIN_WITHDRAWALS_KEY, params],
        queryFn: () => admin_wallet_service_1.adminWalletService.getWithdrawals(params),
        staleTime: 1000 * 60,
    });
};
exports.useAdminWithdrawals = useAdminWithdrawals;
const useProcessWithdrawal = (onSuccessCallback) => {
    const queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: ({ id, payload }) => admin_wallet_service_1.adminWalletService.processWithdrawal(id, payload),
        onSuccess: (data) => {
            sonner_1.toast.success('Xử lý thành công', { description: data.message });
            queryClient.invalidateQueries({ queryKey: exports.ADMIN_WITHDRAWALS_KEY });
            if (onSuccessCallback)
                onSuccessCallback();
        },
        onError: (error) => {
            const parsed = (0, error_parser_1.parseApiError)(error);
            sonner_1.toast.error('Lỗi xử lý yêu cầu', { description: parsed.message });
        },
    });
};
exports.useProcessWithdrawal = useProcessWithdrawal;
//# sourceMappingURL=useAdminWithdrawals.js.map