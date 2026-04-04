"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.billingService = void 0;
const axios_client_1 = require("@/shared/lib/axios-client");
const api_endpoints_1 = require("@/config/api-endpoints");
exports.billingService = {
    checkoutCourse: async (courseId) => {
        return axios_client_1.axiosClient.post(api_endpoints_1.API_ENDPOINTS.ENROLLMENTS.ENROLL(courseId), {});
    },
    getMyWallet: async () => {
        return axios_client_1.axiosClient.get(api_endpoints_1.API_ENDPOINTS.WALLETS.ME);
    },
    getMyTransactions: async (params) => {
        return axios_client_1.axiosClient.get(api_endpoints_1.API_ENDPOINTS.WALLETS.TRANSACTIONS, { params });
    },
    deposit: async (amount) => {
        return axios_client_1.axiosClient.post(api_endpoints_1.API_ENDPOINTS.WALLETS.MOCK_DEPOSIT, { amount });
    },
    withdraw: async (payload) => {
        return axios_client_1.axiosClient.post(api_endpoints_1.API_ENDPOINTS.WALLETS.WITHDRAW, payload);
    }
};
//# sourceMappingURL=billing.service.js.map