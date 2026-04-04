"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useMyTransactions = exports.useSyncWallet = exports.useMockDeposit = exports.useCheckoutFlow = exports.WALLET_TRANSACTIONS_KEY = void 0;
const react_query_1 = require("@tanstack/react-query");
const navigation_1 = require("next/navigation");
const billing_service_1 = require("../api/billing.service");
const billing_ui_store_1 = require("../stores/billing-ui.store");
const transaction_confirm_store_1 = require("../stores/transaction-confirm.store");
const auth_store_1 = require("@/features/auth/stores/auth.store");
const course_keys_1 = require("@/features/courses/api/course-keys");
const routes_1 = require("@/config/routes");
const error_parser_1 = require("@/shared/lib/error-parser");
const sonner_1 = require("sonner");
exports.WALLET_TRANSACTIONS_KEY = ['wallets', 'transactions'];
const useCheckoutFlow = () => {
    const router = (0, navigation_1.useRouter)();
    const queryClient = (0, react_query_1.useQueryClient)();
    const openDepositModal = (0, billing_ui_store_1.useBillingUIStore)((state) => state.openDepositModal);
    const openConfirm = (0, transaction_confirm_store_1.useTransactionConfirmStore)((state) => state.openConfirm);
    const isAuthenticated = (0, auth_store_1.useAuthStore)((state) => state.isAuthenticated);
    const mutation = (0, react_query_1.useMutation)({
        mutationFn: (courseId) => billing_service_1.billingService.checkoutCourse(courseId),
        onSuccess: (data, courseId) => {
            sonner_1.toast.success('Thành công!', { description: data.message });
            queryClient.invalidateQueries({ queryKey: course_keys_1.courseQueryKeys.walletBalance() });
            queryClient.invalidateQueries({ queryKey: exports.WALLET_TRANSACTIONS_KEY });
            queryClient.invalidateQueries({ queryKey: course_keys_1.courseQueryKeys.publicDetails() });
            queryClient.invalidateQueries({ queryKey: course_keys_1.courseQueryKeys.studyTrees() });
            router.push(routes_1.ROUTES.STUDENT.STUDY_ROOM(courseId));
        },
        onError: (error, courseId) => {
            const parsed = (0, error_parser_1.parseApiError)(error);
            if (parsed.statusCode === 409) {
                sonner_1.toast.success('Bạn đã sở hữu khóa học này!', {
                    description: 'Đang chuyển hướng vào phòng học...'
                });
                router.push(routes_1.ROUTES.STUDENT.STUDY_ROOM(courseId));
                return;
            }
            if (parsed.statusCode === 400 && parsed.message.toLowerCase().includes('số dư')) {
                sonner_1.toast.error('Giao dịch bị từ chối', { description: parsed.message });
                openDepositModal();
                return;
            }
            sonner_1.toast.error('Giao dịch thất bại', { description: parsed.message });
        }
    });
    const handleCheckout = async (course) => {
        if (!isAuthenticated) {
            sonner_1.toast.info('Vui lòng đăng nhập để tiếp tục.');
            router.push(`${routes_1.ROUTES.AUTH.LOGIN}?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
            return;
        }
        const finalPrice = course.discountPrice ?? course.price;
        if (finalPrice > 0) {
            const currentZustandBalance = auth_store_1.useAuthStore.getState().user?.balance ?? 0;
            if (currentZustandBalance < finalPrice) {
                const missingAmount = finalPrice - currentZustandBalance;
                sonner_1.toast.warning('Số dư ví không đủ.', { description: 'Vui lòng nạp thêm tiền để thanh toán.' });
                openDepositModal(missingAmount);
                return;
            }
            openConfirm({
                title: 'Thanh toán khóa học',
                description: `Bạn đang thực hiện mua khóa học: "${course.title}"`,
                actionType: 'PAYMENT',
                amount: finalPrice,
                currentBalance: currentZustandBalance,
                onConfirm: async () => {
                    await mutation.mutateAsync(course.id).catch(() => { });
                }
            });
        }
        else {
            mutation.mutate(course.id);
        }
    };
    return {
        handleCheckout,
        isProcessing: mutation.isPending
    };
};
exports.useCheckoutFlow = useCheckoutFlow;
const useMockDeposit = () => {
    const queryClient = (0, react_query_1.useQueryClient)();
    const closeDepositModal = (0, billing_ui_store_1.useBillingUIStore)((state) => state.closeDepositModal);
    return (0, react_query_1.useMutation)({
        mutationFn: (amount) => billing_service_1.billingService.deposit(amount),
        onSuccess: (data) => {
            sonner_1.toast.success('Nạp tiền thành công!', {
                description: `Số dư ví hiện tại: ${data.balance.toLocaleString()}đ`
            });
            auth_store_1.useAuthStore.getState().updateBalance(data.balance);
            queryClient.invalidateQueries({ queryKey: course_keys_1.courseQueryKeys.walletBalance() });
            queryClient.invalidateQueries({ queryKey: exports.WALLET_TRANSACTIONS_KEY });
            closeDepositModal();
        },
        onError: (error) => {
            const parsed = (0, error_parser_1.parseApiError)(error);
            sonner_1.toast.error('Giao dịch thất bại', { description: parsed.message });
            closeDepositModal();
        }
    });
};
exports.useMockDeposit = useMockDeposit;
const useSyncWallet = () => {
    const isAuthenticated = (0, auth_store_1.useAuthStore)((state) => state.isAuthenticated);
    return (0, react_query_1.useQuery)({
        queryKey: course_keys_1.courseQueryKeys.walletBalance(),
        queryFn: billing_service_1.billingService.getMyWallet,
        enabled: isAuthenticated,
        staleTime: 1000 * 60,
        gcTime: 1000 * 60 * 5,
        retry: 1,
    });
};
exports.useSyncWallet = useSyncWallet;
const useMyTransactions = (page = 1, limit = 10) => {
    return (0, react_query_1.useQuery)({
        queryKey: [...exports.WALLET_TRANSACTIONS_KEY, page, limit],
        queryFn: () => billing_service_1.billingService.getMyTransactions({ page, limit }),
        staleTime: 1000 * 60,
    });
};
exports.useMyTransactions = useMyTransactions;
//# sourceMappingURL=useBillingFlows.js.map