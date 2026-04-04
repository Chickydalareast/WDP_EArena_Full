'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useLogin = void 0;
const react_query_1 = require("@tanstack/react-query");
const navigation_1 = require("next/navigation");
const sonner_1 = require("sonner");
const auth_service_1 = require("../api/auth.service");
const post_auth_redirect_1 = require("../lib/post-auth-redirect");
const useLogin = () => {
    const router = (0, navigation_1.useRouter)();
    const searchParams = (0, navigation_1.useSearchParams)();
    const queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: auth_service_1.authService.login,
        onSuccess: (user) => {
            queryClient.setQueryData(auth_service_1.authKeys.session(), user);
            sonner_1.toast.success('Đăng nhập thành công');
            const callbackUrl = searchParams.get('callbackUrl');
            router.replace((0, post_auth_redirect_1.resolvePostAuthRoute)(user, callbackUrl));
        },
        onError: (error) => {
            sonner_1.toast.error('Đăng nhập thất bại', {
                description: error.message
            });
        },
    });
};
exports.useLogin = useLogin;
//# sourceMappingURL=useLogin.js.map