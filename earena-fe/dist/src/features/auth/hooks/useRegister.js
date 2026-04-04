'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useRegister = void 0;
const react_query_1 = require("@tanstack/react-query");
const navigation_1 = require("next/navigation");
const sonner_1 = require("sonner");
const auth_service_1 = require("../api/auth.service");
const auth_flow_store_1 = require("../stores/auth-flow.store");
const auth_store_1 = require("../stores/auth.store");
const post_auth_redirect_1 = require("../lib/post-auth-redirect");
const useRegister = () => {
    const router = (0, navigation_1.useRouter)();
    const resetFlow = (0, auth_flow_store_1.useAuthFlowStore)((state) => state.resetFlow);
    const setAuth = (0, auth_store_1.useAuthStore)((state) => state.setAuth);
    return (0, react_query_1.useMutation)({
        mutationFn: auth_service_1.authService.register,
        onSuccess: (user) => {
            setAuth(user);
            resetFlow();
            sonner_1.toast.success('Đăng ký thành công', {
                description: 'Đang khởi tạo không gian làm việc...',
            });
            router.replace((0, post_auth_redirect_1.getPostAuthLandingPath)(user));
        },
        onError: (error) => {
            const isTicketInvalid = error.statusCode === 400 || error.code === 'INVALID_TICKET';
            if (isTicketInvalid) {
                sonner_1.toast.error('Phiên đăng ký hết hạn', {
                    description: 'Phiên làm việc đã quá 15 phút hoặc không hợp lệ. Vui lòng bắt đầu lại.',
                });
                resetFlow();
            }
            else {
                sonner_1.toast.error('Đăng ký thất bại', {
                    description: error.message,
                });
            }
        },
    });
};
exports.useRegister = useRegister;
//# sourceMappingURL=useRegister.js.map