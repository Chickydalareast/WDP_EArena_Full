'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useChangePassword = void 0;
const react_query_1 = require("@tanstack/react-query");
const sonner_1 = require("sonner");
const auth_service_1 = require("../api/auth.service");
const useLogout_1 = require("./useLogout");
const useChangePassword = () => {
    const { mutate: executeLogout } = (0, useLogout_1.useLogout)();
    return (0, react_query_1.useMutation)({
        mutationFn: auth_service_1.authService.changePassword,
        onSuccess: (data) => {
            sonner_1.toast.success('Đổi mật khẩu thành công', {
                description: 'Vui lòng đăng nhập lại với mật khẩu mới.',
            });
            executeLogout();
        },
        onError: (error) => {
            sonner_1.toast.error('Lỗi đổi mật khẩu', {
                description: error.message,
            });
        },
    });
};
exports.useChangePassword = useChangePassword;
//# sourceMappingURL=useChangePassword.js.map