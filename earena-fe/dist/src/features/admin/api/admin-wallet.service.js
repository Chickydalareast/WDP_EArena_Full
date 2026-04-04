"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminWalletService = void 0;
const axios_client_1 = require("@/shared/lib/axios-client");
const api_endpoints_1 = require("@/config/api-endpoints");
exports.adminWalletService = {
    getWithdrawals: async (params) => {
        return axios_client_1.axiosClient.get(api_endpoints_1.API_ENDPOINTS.ADMIN_WALLETS.WITHDRAWALS, { params });
    },
    processWithdrawal: async (id, payload) => {
        return axios_client_1.axiosClient.patch(api_endpoints_1.API_ENDPOINTS.ADMIN_WALLETS.PROCESS_WITHDRAWAL(id), payload);
    },
};
//# sourceMappingURL=admin-wallet.service.js.map