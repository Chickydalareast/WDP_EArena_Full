"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.examHistoryService = exports.examHistoryKeys = void 0;
const axios_client_1 = require("@/shared/lib/axios-client");
const api_endpoints_1 = require("@/config/api-endpoints");
exports.examHistoryKeys = {
    all: ['exam-history'],
    overview: () => [...exports.examHistoryKeys.all, 'overview'],
    lesson: (lessonId) => [...exports.examHistoryKeys.all, 'lesson', lessonId],
};
exports.examHistoryService = {
    getOverview: async () => {
        const response = await axios_client_1.axiosClient.get(api_endpoints_1.API_ENDPOINTS.EXAM_TAKING.HISTORY_OVERVIEW);
        return response?.data?.data || response?.data || [];
    },
    getLessonAttempts: async (lessonId) => {
        const response = await axios_client_1.axiosClient.get(api_endpoints_1.API_ENDPOINTS.EXAM_TAKING.HISTORY_LESSON(lessonId));
        return response?.data?.data || response?.data || [];
    }
};
//# sourceMappingURL=exam-history.service.js.map