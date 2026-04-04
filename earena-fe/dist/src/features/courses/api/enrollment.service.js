"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enrollmentService = void 0;
const axios_client_1 = require("@/shared/lib/axios-client");
const api_endpoints_1 = require("@/config/api-endpoints");
exports.enrollmentService = {
    getMyLearning: async (page = 1, limit = 10) => {
        return axios_client_1.axiosClient.get(api_endpoints_1.API_ENDPOINTS.COURSES.MY_LEARNING, {
            params: { page, limit }
        });
    }
};
//# sourceMappingURL=enrollment.service.js.map