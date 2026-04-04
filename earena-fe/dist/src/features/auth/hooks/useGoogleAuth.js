'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useGoogleAuth = void 0;
const react_query_1 = require("@tanstack/react-query");
const navigation_1 = require("next/navigation");
const sonner_1 = require("sonner");
const auth_service_1 = require("../api/auth.service");
const auth_store_1 = require("../stores/auth.store");
const post_auth_redirect_1 = require("../lib/post-auth-redirect");
const useGoogleAuth = () => {
    const router = (0, navigation_1.useRouter)();
    const searchParams = (0, navigation_1.useSearchParams)();
    const queryClient = (0, react_query_1.useQueryClient)();
    const setAuth = (0, auth_store_1.useAuthStore)((state) => state.setAuth);
    return (0, react_query_1.useMutation)({
        mutationFn: (idToken) => auth_service_1.authService.googleLogin({ idToken }),
        onSuccess: (user) => {
            setAuth(user);
            queryClient.setQueryData(auth_service_1.authKeys.session(), user);
            sonner_1.toast.success('Đăng nhập Google thành công');
            const callbackUrl = searchParams.get('callbackUrl');
            router.replace((0, post_auth_redirect_1.resolvePostAuthRoute)(user, callbackUrl));
        },
        onError: (error) => {
            sonner_1.toast.error('Xác thực Google thất bại', {
                description: error.message
            });
        },
    });
};
exports.useGoogleAuth = useGoogleAuth;
//# sourceMappingURL=useGoogleAuth.js.map