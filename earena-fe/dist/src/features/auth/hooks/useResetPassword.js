'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useResetPassword = void 0;
const react_query_1 = require("@tanstack/react-query");
const navigation_1 = require("next/navigation");
const sonner_1 = require("sonner");
const auth_service_1 = require("../api/auth.service");
const auth_flow_store_1 = require("../stores/auth-flow.store");
const useResetPassword = () => {
    const router = (0, navigation_1.useRouter)();
    const resetFlow = (0, auth_flow_store_1.useAuthFlowStore)((state) => state.resetFlow);
    return (0, react_query_1.useMutation)({
        mutationFn: auth_service_1.authService.resetPassword,
        onSuccess: (data) => {
            resetFlow();
            sonner_1.toast.success('Thành công', {
                description: data.message || 'Mật khẩu đã được đặt lại.',
            });
            router.replace('/login');
        },
        onError: (error) => {
            const isTicketInvalid = error.statusCode === 400 || error.code === 'INVALID_TICKET';
            if (isTicketInvalid) {
                sonner_1.toast.error('Phiên làm việc hết hạn', {
                    description: 'Vé xác thực đã hết hạn hoặc không hợp lệ. Vui lòng thử lại.',
                });
                resetFlow();
            }
            else {
                sonner_1.toast.error('Thất bại', {
                    description: error.message,
                });
            }
        },
    });
};
exports.useResetPassword = useResetPassword;
//# sourceMappingURL=useResetPassword.js.map