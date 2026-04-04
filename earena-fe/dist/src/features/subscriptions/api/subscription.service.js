"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscriptionService = void 0;
const axios_client_1 = require("@/shared/lib/axios-client");
const api_endpoints_1 = require("@/config/api-endpoints");
exports.subscriptionService = {
    getPlans: async () => {
        return axios_client_1.axiosClient.get(api_endpoints_1.API_ENDPOINTS.SUBSCRIPTIONS.PLANS);
    },
    upgradePlan: async (payload) => {
        return axios_client_1.axiosClient.post(api_endpoints_1.API_ENDPOINTS.SUBSCRIPTIONS.UPGRADE, payload);
    },
};
//# sourceMappingURL=subscription.service.js.map