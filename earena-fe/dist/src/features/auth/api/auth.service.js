"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.authKeys = void 0;
const axios_client_1 = require("@/shared/lib/axios-client");
const api_endpoints_1 = require("@/config/api-endpoints");
const env_1 = require("@/config/env");
exports.authKeys = {
    all: ['auth'],
    session: () => [...exports.authKeys.all, 'session'],
};
exports.authService = {
    login: async (data) => {
        return axios_client_1.axiosClient.post(api_endpoints_1.API_ENDPOINTS.AUTH.LOGIN, data);
    },
    logout: async () => {
        return axios_client_1.axiosClient.post(api_endpoints_1.API_ENDPOINTS.AUTH.LOGOUT);
    },
    sendOtp: async (data) => {
        return axios_client_1.axiosClient.post(api_endpoints_1.API_ENDPOINTS.AUTH.SEND_OTP, data);
    },
    verifyOtp: async (data) => {
        return axios_client_1.axiosClient.post(api_endpoints_1.API_ENDPOINTS.AUTH.VERIFY_OTP, data);
    },
    register: async (data) => {
        return axios_client_1.axiosClient.post(api_endpoints_1.API_ENDPOINTS.AUTH.REGISTER, data);
    },
    uploadRegisterQualification: async (params) => {
        const fd = new FormData();
        fd.append('file', params.file);
        fd.append('email', params.email);
        fd.append('ticket', params.ticket);
        fd.append('name', params.name);
        const base = env_1.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '');
        const res = await fetch(`${base}${api_endpoints_1.API_ENDPOINTS.AUTH.REGISTER_QUALIFICATION_UPLOAD}`, {
            method: 'POST',
            body: fd,
            credentials: 'include',
        });
        const json = (await res.json().catch(() => ({})));
        if (!res.ok) {
            const msg = json?.message ?? 'Không thể tải ảnh lên. Vui lòng thử lại.';
            const text = Array.isArray(msg) ? msg.join(', ') : String(msg);
            throw new Error(text);
        }
        const payload = json.data;
        if (!payload?.url)
            throw new Error('Phản hồi máy chủ không hợp lệ.');
        return payload;
    },
    resetPassword: async (data) => {
        return axios_client_1.axiosClient.post(api_endpoints_1.API_ENDPOINTS.AUTH.RESET_PASSWORD, data);
    },
    changePassword: async (data) => {
        return axios_client_1.axiosClient.post(api_endpoints_1.API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
    },
    googleLogin: async (data) => {
        return axios_client_1.axiosClient.post(api_endpoints_1.API_ENDPOINTS.AUTH.GOOGLE, data);
    },
    getProfile: async () => {
        return axios_client_1.axiosClient.get(api_endpoints_1.API_ENDPOINTS.AUTH.ME);
    },
};
//# sourceMappingURL=auth.service.js.map