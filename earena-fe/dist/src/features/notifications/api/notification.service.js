"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = exports.notificationKeys = void 0;
const axios_client_1 = require("@/shared/lib/axios-client");
const api_endpoints_1 = require("@/config/api-endpoints");
exports.notificationKeys = {
    all: ['notifications'],
    lists: () => [...exports.notificationKeys.all, 'list'],
};
exports.notificationService = {
    getHistory: async (page = 1, limit = 10) => {
        return axios_client_1.axiosClient.get(api_endpoints_1.API_ENDPOINTS.NOTIFICATIONS.BASE, {
            params: { page, limit },
        });
    },
    markAsRead: async (id) => {
        return axios_client_1.axiosClient.patch(api_endpoints_1.API_ENDPOINTS.NOTIFICATIONS.READ(id));
    },
    markAllAsRead: async () => {
        return axios_client_1.axiosClient.patch(api_endpoints_1.API_ENDPOINTS.NOTIFICATIONS.READ_ALL);
    },
};
//# sourceMappingURL=notification.service.js.map