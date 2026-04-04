"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.examBuilderService = void 0;
const axios_client_1 = require("@/shared/lib/axios-client");
const api_endpoints_1 = require("@/config/api-endpoints");
exports.examBuilderService = {
    initExam: async (data) => {
        return axios_client_1.axiosClient.post(api_endpoints_1.API_ENDPOINTS.EXAMS.MANUAL_INIT, data);
    },
    updateExamInfo: async (examId, data) => {
        return axios_client_1.axiosClient.patch(`${api_endpoints_1.API_ENDPOINTS.EXAMS.BASE}/${examId}`, data);
    },
    deleteExam: async (examId) => {
        return axios_client_1.axiosClient.delete(`${api_endpoints_1.API_ENDPOINTS.EXAMS.BASE}/${examId}`);
    },
    generateExam: async (data) => {
        return axios_client_1.axiosClient.post(api_endpoints_1.API_ENDPOINTS.EXAMS.GENERATE, data);
    },
    getPaperPreview: async (paperId) => {
        return axios_client_1.axiosClient.get(api_endpoints_1.API_ENDPOINTS.EXAMS.PAPER_PREVIEW(paperId));
    },
    updatePaperQuestions: async (paperId, data) => {
        return axios_client_1.axiosClient.patch(api_endpoints_1.API_ENDPOINTS.EXAMS.PAPER_QUESTIONS(paperId), data);
    },
    publishExam: async (examId) => {
        return axios_client_1.axiosClient.post(api_endpoints_1.API_ENDPOINTS.EXAMS.PUBLISH(examId));
    },
    getLeaderboard: async (courseId, lessonId, params) => {
        return axios_client_1.axiosClient.get(`/exams/leaderboard/courses/${courseId}/lessons/${lessonId}`, { params });
    },
    bulkCreateQuestionsAndReturnIds: async (data) => {
        return axios_client_1.axiosClient.post(api_endpoints_1.API_ENDPOINTS.QUESTIONS.BULK_CREATE, data);
    },
    deleteQuestion: async (questionId) => {
        return axios_client_1.axiosClient.delete(api_endpoints_1.API_ENDPOINTS.QUESTIONS.DETAIL(questionId));
    },
    updateSingleQuestion: async (questionId, payload) => {
        return axios_client_1.axiosClient.patch(api_endpoints_1.API_ENDPOINTS.QUESTIONS.DETAIL(questionId), payload);
    },
    updatePassageQuestion: async (passageId, payload) => {
        return axios_client_1.axiosClient.put(api_endpoints_1.API_ENDPOINTS.QUESTIONS.PASSAGE(passageId), payload);
    },
    getMatrices: async (params) => {
        return axios_client_1.axiosClient.get(api_endpoints_1.API_ENDPOINTS.EXAM_MATRICES.BASE, { params });
    },
    getMatrixDetail: async (matrixId) => {
        return axios_client_1.axiosClient.get(api_endpoints_1.API_ENDPOINTS.EXAM_MATRICES.DETAIL(matrixId));
    },
    fillFromMatrix: async (paperId, data) => {
        return axios_client_1.axiosClient.post(api_endpoints_1.API_ENDPOINTS.EXAMS.FILL_FROM_MATRIX(paperId), data, {
            timeout: 30000
        });
    },
    updatePoints: async (paperId, data) => {
        return axios_client_1.axiosClient.patch(api_endpoints_1.API_ENDPOINTS.EXAMS.UPDATE_POINTS(paperId), data);
    },
    getActiveFilters: async (payload, config) => {
        return axios_client_1.axiosClient.post(api_endpoints_1.API_ENDPOINTS.QUESTIONS.ACTIVE_FILTERS, payload, config);
    },
    previewMatrixRule: async (paperId, payload, config) => {
        return axios_client_1.axiosClient.post(api_endpoints_1.API_ENDPOINTS.EXAMS.PREVIEW_MATRIX_RULE(paperId), payload, config);
    },
    previewDynamicExam: async (payload) => {
        return axios_client_1.axiosClient.post(api_endpoints_1.API_ENDPOINTS.EXAMS.DYNAMIC_PREVIEW, payload);
    },
};
//# sourceMappingURL=exam-builder.service.js.map