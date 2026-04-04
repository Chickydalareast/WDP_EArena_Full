"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.axiosClient = void 0;
const axios_1 = __importStar(require("axios"));
const api_endpoints_1 = require("@/config/api-endpoints");
const env_1 = require("@/config/env");
const error_parser_1 = require("./error-parser");
const sonner_1 = require("sonner");
exports.axiosClient = axios_1.default.create({
    baseURL: env_1.env.NEXT_PUBLIC_API_URL,
    timeout: 15000,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
});
exports.axiosClient.interceptors.request.use((config) => {
    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
        const headers = axios_1.AxiosHeaders.from(config.headers);
        headers.delete('Content-Type');
        config.headers = headers;
    }
    return config;
});
let isRefreshing = false;
let failedQueue = [];
const processQueue = (error) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        }
        else {
            prom.resolve();
        }
    });
    failedQueue = [];
};
const NO_REFRESH_ENDPOINTS = [
    api_endpoints_1.API_ENDPOINTS.AUTH.LOGIN,
    api_endpoints_1.API_ENDPOINTS.AUTH.REGISTER,
    api_endpoints_1.API_ENDPOINTS.AUTH.REFRESH,
    api_endpoints_1.API_ENDPOINTS.AUTH.LOGOUT
];
exports.axiosClient.interceptors.response.use((response) => {
    const { data } = response;
    if (data && data.statusCode && 'data' in data) {
        if ('meta' in data) {
            return { data: data.data, meta: data.meta };
        }
        return data.data;
    }
    return data;
}, async (error) => {
    const originalRequest = error.config;
    const isServer = typeof window === 'undefined';
    if (!error.response)
        return Promise.reject((0, error_parser_1.parseApiError)(error));
    if (error.response.status === 429 && !isServer) {
        sonner_1.toast.error('Hệ thống đang quá tải hoặc bạn thao tác quá nhanh. Vui lòng thử lại sau.');
        return Promise.reject((0, error_parser_1.parseApiError)(error));
    }
    if (error.response.status === 403 && !isServer) {
        const data = error.response.data;
        const message = data?.message || '';
        if (typeof message === 'string' &&
            (message.includes('chưa được xác minh') || message.includes('chưa được phê duyệt'))) {
            window.location.href = '/waiting-approval';
            return Promise.reject((0, error_parser_1.parseApiError)(error));
        }
    }
    const isNoRefreshEndpoint = originalRequest.url
        ? NO_REFRESH_ENDPOINTS.some(url => originalRequest.url?.includes(url))
        : false;
    if (error.response.status === 401 && originalRequest && !originalRequest._retry && !isNoRefreshEndpoint) {
        if (isServer) {
            return Promise.reject((0, error_parser_1.parseApiError)(error));
        }
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            })
                .then(() => (0, exports.axiosClient)(originalRequest))
                .catch((err) => Promise.reject(err));
        }
        originalRequest._retry = true;
        isRefreshing = true;
        try {
            await axios_1.default.post(`${env_1.env.NEXT_PUBLIC_API_URL}${api_endpoints_1.API_ENDPOINTS.AUTH.REFRESH}`, {}, {
                withCredentials: true
            });
            processQueue(null);
            return (0, exports.axiosClient)(originalRequest);
        }
        catch (refreshError) {
            processQueue(refreshError);
            if (!isServer) {
                window.dispatchEvent(new CustomEvent('core:unauthorized'));
            }
            return Promise.reject((0, error_parser_1.parseApiError)(refreshError));
        }
        finally {
            isRefreshing = false;
        }
    }
    return Promise.reject((0, error_parser_1.parseApiError)(error));
});
//# sourceMappingURL=axios-client.js.map