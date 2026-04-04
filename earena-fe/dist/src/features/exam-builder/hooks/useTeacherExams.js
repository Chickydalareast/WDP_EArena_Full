'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTeacherExams = void 0;
const react_query_1 = require("@tanstack/react-query");
const axios_client_1 = require("@/shared/lib/axios-client");
const api_endpoints_1 = require("@/config/api-endpoints");
const query_keys_1 = require("../api/query-keys");
const useTeacherExams = (params) => {
    return (0, react_query_1.useQuery)({
        queryKey: query_keys_1.examQueryKeys.list(params || {}),
        queryFn: async () => {
            const queryParams = new URLSearchParams();
            if (params?.page)
                queryParams.append('page', String(params.page));
            if (params?.limit)
                queryParams.append('limit', String(params.limit));
            if (params?.subjectId)
                queryParams.append('subjectId', params.subjectId);
            return axios_client_1.axiosClient.get(`${api_endpoints_1.API_ENDPOINTS.EXAMS.BASE}?${queryParams.toString()}`);
        },
        staleTime: 5 * 60 * 1000,
    });
};
exports.useTeacherExams = useTeacherExams;
//# sourceMappingURL=useTeacherExams.js.map