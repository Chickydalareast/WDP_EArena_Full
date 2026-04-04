'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usePaperDetail = void 0;
const react_query_1 = require("@tanstack/react-query");
const axios_client_1 = require("@/shared/lib/axios-client");
const api_endpoints_1 = require("@/config/api-endpoints");
const query_keys_1 = require("../api/query-keys");
const usePaperDetail = (paperId) => {
    return (0, react_query_1.useQuery)({
        queryKey: query_keys_1.examQueryKeys.paperDetail(paperId),
        queryFn: async () => {
            if (!paperId)
                throw new Error('Missing paperId');
            return axios_client_1.axiosClient.get(api_endpoints_1.API_ENDPOINTS.EXAMS.PAPER_PREVIEW(paperId));
        },
        enabled: !!paperId,
        staleTime: 0,
    });
};
exports.usePaperDetail = usePaperDetail;
//# sourceMappingURL=usePaperDetail.js.map