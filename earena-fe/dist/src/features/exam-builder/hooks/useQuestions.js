'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useQuestions = void 0;
const react_query_1 = require("@tanstack/react-query");
const axios_client_1 = require("@/shared/lib/axios-client");
const api_endpoints_1 = require("@/config/api-endpoints");
const useQuestions = (params) => {
    return (0, react_query_1.useQuery)({
        queryKey: ['questions', 'bank', params],
        queryFn: async () => {
            const queryParams = new URLSearchParams({
                page: String(params?.page || 1),
                limit: String(params?.limit || 20),
                isDraft: 'false',
                ...(params?.topicId && { topicId: params.topicId }),
                ...(params?.difficultyLevel && { difficultyLevel: params.difficultyLevel }),
            });
            return axios_client_1.axiosClient.get(`${api_endpoints_1.API_ENDPOINTS.QUESTIONS.BASE}?${queryParams.toString()}`);
        },
        staleTime: 5 * 60 * 1000,
    });
};
exports.useQuestions = useQuestions;
//# sourceMappingURL=useQuestions.js.map