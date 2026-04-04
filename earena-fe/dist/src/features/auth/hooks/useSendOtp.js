'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSendOtp = void 0;
const react_query_1 = require("@tanstack/react-query");
const sonner_1 = require("sonner");
const auth_service_1 = require("../api/auth.service");
const auth_flow_store_1 = require("../stores/auth-flow.store");
const useSendOtp = () => {
    const { setStep, setEmail, setResendAvailableAt } = (0, auth_flow_store_1.useAuthFlowStore)();
    return (0, react_query_1.useMutation)({
        mutationFn: auth_service_1.authService.sendOtp,
        onSuccess: (_, variables) => {
            setEmail(variables.email);
            setResendAvailableAt(Date.now() + 60 * 1000);
            setStep('VERIFY_OTP');
            sonner_1.toast.success('Đã gửi mã xác nhận', {
                description: `Vui lòng kiểm tra hộp thư ${variables.email}`,
            });
        },
        onError: (error) => {
            sonner_1.toast.error('Gửi mã thất bại', {
                description: error.message
            });
        },
    });
};
exports.useSendOtp = useSendOtp;
//# sourceMappingURL=useSendOtp.js.map