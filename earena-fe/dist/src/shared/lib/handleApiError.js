"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleApiError = void 0;
const axios_1 = require("axios");
const handleApiError = (error) => {
    if (error instanceof axios_1.AxiosError) {
        const status = error.response?.status || 500;
        const data = error.response?.data;
        const rawMessage = data?.message;
        const message = Array.isArray(rawMessage)
            ? rawMessage[0]
            : rawMessage || error.message;
        const code = data?.code || data?.error || 'UNKNOWN_ERROR';
        switch (status) {
            case 400:
                return { status, code, message: message || 'Dữ liệu đầu vào không hợp lệ.' };
            case 401:
                return { status, code, message: 'Phiên đăng nhập hết hạn hoặc không hợp lệ.' };
            case 403:
                return { status, code, message: 'Bạn không có quyền thực hiện hành động này.' };
            case 404:
                return { status, code, message: 'Không tìm thấy tài nguyên hệ thống.' };
            case 429:
                return { status, code, message: 'Thao tác quá nhanh. Vui lòng đợi một lát.' };
            case 500:
                return { status, code, message: 'Lỗi máy chủ nội bộ. Vui lòng thử lại sau.' };
            default:
                return { status, code, message: message || 'Đã có lỗi không xác định xảy ra.' };
        }
    }
    return {
        status: 500,
        code: 'INTERNAL_CLIENT_ERROR',
        message: error.message || 'Lỗi hệ thống cục bộ.',
    };
};
exports.handleApiError = handleApiError;
//# sourceMappingURL=handleApiError.js.map