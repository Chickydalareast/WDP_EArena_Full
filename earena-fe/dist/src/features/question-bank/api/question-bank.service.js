"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.questionBankService = void 0;
const axios_client_1 = require("@/shared/lib/axios-client");
const api_endpoints_1 = require("@/config/api-endpoints");
exports.questionBankService = {
    getFolderTree: async () => {
        return axios_client_1.axiosClient.get(api_endpoints_1.API_ENDPOINTS.QUESTION_FOLDERS.BASE);
    },
    createFolder: async (data) => {
        return axios_client_1.axiosClient.post(api_endpoints_1.API_ENDPOINTS.QUESTION_FOLDERS.BASE, data);
    },
    updateFolder: async (id, data) => {
        return axios_client_1.axiosClient.patch(api_endpoints_1.API_ENDPOINTS.QUESTION_FOLDERS.DETAIL(id), data);
    },
    deleteFolder: async (id) => {
        return axios_client_1.axiosClient.delete(api_endpoints_1.API_ENDPOINTS.QUESTION_FOLDERS.DETAIL(id));
    },
    getQuestionsByFolder: async (params) => {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                if (Array.isArray(value)) {
                    if (value.length > 0) {
                        queryParams.append(key, value.join(','));
                    }
                }
                else {
                    queryParams.append(key, String(value));
                }
            }
        });
        return axios_client_1.axiosClient.get(`${api_endpoints_1.API_ENDPOINTS.QUESTIONS.BASE}?${queryParams.toString()}`);
    },
    bulkCreateQuestions: async (data) => {
        return axios_client_1.axiosClient.post(api_endpoints_1.API_ENDPOINTS.QUESTIONS.BULK_CREATE, data);
    },
    bulkMoveQuestions: async (data) => {
        return axios_client_1.axiosClient.patch(api_endpoints_1.API_ENDPOINTS.QUESTIONS.BULK_MOVE, data);
    },
    cloneQuestion: async (id, data) => {
        return axios_client_1.axiosClient.post(api_endpoints_1.API_ENDPOINTS.QUESTIONS.CLONE(id), data);
    },
    bulkCloneQuestions: async (data) => {
        return axios_client_1.axiosClient.post(api_endpoints_1.API_ENDPOINTS.QUESTIONS.BULK_CLONE, data);
    },
    bulkDeleteQuestions: async (data) => {
        return axios_client_1.axiosClient.post(api_endpoints_1.API_ENDPOINTS.QUESTIONS.BULK_DELETE, data);
    },
    generateAiQuestions: async (data) => {
        const formData = new FormData();
        data.files.forEach((file) => {
            formData.append('files', file);
        });
        formData.append('folderId', data.folderId);
        if (data.additionalInstructions?.trim()) {
            formData.append('additionalInstructions', data.additionalInstructions.trim());
        }
        return axios_client_1.axiosClient.post(api_endpoints_1.API_ENDPOINTS.QUESTIONS.AI_GENERATE, formData, {
            timeout: 180000,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
    previewAutoOrganize: async (data) => {
        return axios_client_1.axiosClient.post(api_endpoints_1.API_ENDPOINTS.QUESTIONS.ORGANIZE_PREVIEW, data);
    },
    executeAutoOrganize: async (data) => {
        return axios_client_1.axiosClient.post(api_endpoints_1.API_ENDPOINTS.QUESTIONS.ORGANIZE_EXECUTE, data);
    },
    bulkAutoTag: async (data) => {
        return axios_client_1.axiosClient.post(api_endpoints_1.API_ENDPOINTS.QUESTIONS.BULK_AUTO_TAG, data);
    },
    bulkPublishQuestions: async (data) => {
        return axios_client_1.axiosClient.patch(api_endpoints_1.API_ENDPOINTS.QUESTIONS.BULK_PUBLISH, data);
    },
};
//# sourceMappingURL=question-bank.service.js.map