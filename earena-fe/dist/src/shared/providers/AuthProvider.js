'use client';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AuthProvider;
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const react_query_1 = require("@tanstack/react-query");
const auth_store_1 = require("@/features/auth/stores/auth.store");
const auth_service_1 = require("@/features/auth/api/auth.service");
const sonner_1 = require("sonner");
const useSession_1 = require("@/features/auth/hooks/useSession");
const useBillingFlows_1 = require("@/features/billing/hooks/useBillingFlows");
const dynamic_1 = __importDefault(require("next/dynamic"));
const useNotificationStream_1 = require("@/features/notifications/hooks/useNotificationStream");
const useMessagingRealtime_1 = require("@/features/messaging/hooks/useMessagingRealtime");
const routes_1 = require("@/config/routes");
const WAITING = routes_1.ROUTES.AUTH.WAITING_APPROVAL;
const DynamicDepositModal = (0, dynamic_1.default)(() => import('@/features/billing/components/DepositModal').then((mod) => mod.DepositModal), { ssr: false });
function AuthProvider({ children }) {
    const router = (0, navigation_1.useRouter)();
    const pathname = (0, navigation_1.usePathname)();
    const queryClient = (0, react_query_1.useQueryClient)();
    const { setAuth, clearAuth, setInitialized, updateBalance } = (0, auth_store_1.useAuthStore)();
    const { user, isError, isSuccess, isFetched } = (0, useSession_1.useSession)();
    const { data: walletData, isSuccess: isWalletSuccess } = (0, useBillingFlows_1.useSyncWallet)();
    const hasRedirectedRef = (0, react_1.useRef)(false);
    (0, react_1.useEffect)(() => {
        if (!isFetched)
            return;
        if (isSuccess && user) {
            const pendingTeacher = user.role === 'TEACHER' && user.teacherVerificationStatus !== 'VERIFIED';
            if (pendingTeacher && !pathname.startsWith(WAITING)) {
                if (!hasRedirectedRef.current) {
                    hasRedirectedRef.current = true;
                    router.replace(WAITING);
                }
                setAuth(user);
                setInitialized();
                return;
            }
            hasRedirectedRef.current = false;
            setAuth(user);
        }
        else if (isError) {
            clearAuth();
        }
        setInitialized();
    }, [isSuccess, isError, user, isFetched, pathname, router, setAuth, clearAuth, setInitialized]);
    (0, react_1.useEffect)(() => {
        if (isWalletSuccess && walletData !== undefined && typeof walletData.balance === 'number') {
            updateBalance(walletData.balance);
        }
    }, [isWalletSuccess, walletData, updateBalance]);
    const handleUnauthorized = (0, react_1.useCallback)(() => {
        clearAuth();
        queryClient.cancelQueries({ queryKey: auth_service_1.authKeys.session() });
        queryClient.setQueryData(auth_service_1.authKeys.session(), null);
        queryClient.removeQueries({
            predicate: (query) => query.queryKey[0] !== 'auth'
        });
        const skipUnauthorizedRedirect = pathname === '/' ||
            pathname.startsWith(routes_1.ROUTES.AUTH.LOGIN) ||
            pathname.startsWith(routes_1.ROUTES.AUTH.REGISTER) ||
            pathname.startsWith(routes_1.ROUTES.AUTH.FORGOT_PASSWORD) ||
            pathname.startsWith(WAITING);
        if (!skipUnauthorizedRedirect) {
            sonner_1.toast.error('Phiên làm việc hết hạn. Vui lòng đăng nhập lại.');
            window.location.href = `/login?clear_session=true&callbackUrl=${encodeURIComponent(pathname)}`;
        }
    }, [pathname, clearAuth, queryClient]);
    (0, react_1.useEffect)(() => {
        window.addEventListener('core:unauthorized', handleUnauthorized);
        return () => window.removeEventListener('core:unauthorized', handleUnauthorized);
    }, [handleUnauthorized]);
    (0, useNotificationStream_1.useNotificationStream)(isSuccess && !!user);
    (0, useMessagingRealtime_1.useMessagingRealtime)(isSuccess && !!user);
    return (<>
      {children}
      <DynamicDepositModal />
    </>);
}
//# sourceMappingURL=AuthProvider.js.map