'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useVerifyOtp = void 0;
const react_query_1 = require("@tanstack/react-query");
const sonner_1 = require("sonner");
const auth_service_1 = require("../api/auth.service");
const auth_flow_store_1 = require("../stores/auth-flow.store");
const useVerifyOtp = () => {
    const { setTicket, setStep, resetFlow } = (0, auth_flow_store_1.useAuthFlowStore)();
    return (0, react_query_1.useMutation)({
        mutationFn: auth_service_1.authService.verifyOtp,
        onSuccess: (data) => {
            if (!data.ticket) {
                sonner_1.toast.error('Lỗi kiến trúc', { description: 'Server không trả về Ticket xác thực.' });
                return;
            }
            setTicket(data.ticket);
            setStep('INPUT_DETAILS');
        },
        onError: (error) => {
            const isExceeded = error.code === 'OTP_ATTEMPTS_EXCEEDED' || error.statusCode === 429;
            if (isExceeded) {
                sonner_1.toast.error('Khóa bảo mật', {
                    description: 'Bạn đã nhập sai quá 5 lần. Vui lòng yêu cầu gửi lại mã mới.'
                });
                resetFlow();
            }
            else {
                sonner_1.toast.error('Xác thực thất bại', {
                    description: error.message
                });
            }
        },
    });
};
exports.useVerifyOtp = useVerifyOtp;
//# sourceMappingURL=useVerifyOtp.js.map