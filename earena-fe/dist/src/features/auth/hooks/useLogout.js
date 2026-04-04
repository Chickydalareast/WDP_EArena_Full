'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useLogout = void 0;
const react_query_1 = require("@tanstack/react-query");
const navigation_1 = require("next/navigation");
const sonner_1 = require("sonner");
const auth_service_1 = require("../api/auth.service");
const routes_1 = require("@/config/routes");
const auth_store_1 = require("../stores/auth.store");
const useLogout = () => {
    const router = (0, navigation_1.useRouter)();
    const queryClient = (0, react_query_1.useQueryClient)();
    const clearAuth = (0, auth_store_1.useAuthStore)((state) => state.clearAuth);
    return (0, react_query_1.useMutation)({
        mutationFn: auth_service_1.authService.logout,
        onSettled: () => {
            clearAuth();
            queryClient.cancelQueries({ queryKey: auth_service_1.authKeys.session() });
            queryClient.setQueryData(auth_service_1.authKeys.session(), null);
            queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== 'auth' });
            sonner_1.toast.success('Đã đăng xuất an toàn');
            router.replace(routes_1.ROUTES.AUTH.LOGIN);
        },
    });
};
exports.useLogout = useLogout;
//# sourceMappingURL=useLogout.js.map