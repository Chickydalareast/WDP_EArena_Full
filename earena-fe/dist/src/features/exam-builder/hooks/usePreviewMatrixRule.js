'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usePreviewMatrixRule = void 0;
const react_query_1 = require("@tanstack/react-query");
const exam_builder_service_1 = require("../api/exam-builder.service");
const query_keys_1 = require("../api/query-keys");
const usePreviewMatrixRule = (paperId, payload) => {
    return (0, react_query_1.useQuery)({
        queryKey: query_keys_1.examQueryKeys.previewRule(paperId, payload),
        queryFn: async ({ signal }) => {
            const cleanPayload = Object.fromEntries(Object.entries(payload).filter(([_, v]) => Array.isArray(v) ? v.length > 0 : v !== undefined));
            return exam_builder_service_1.examBuilderService.previewMatrixRule(paperId, cleanPayload, { signal });
        },
        enabled: !!paperId && payload.folderIds && payload.folderIds.length > 0,
        staleTime: 60 * 1000,
        retry: false,
    });
};
exports.usePreviewMatrixRule = usePreviewMatrixRule;
//# sourceMappingURL=usePreviewMatrixRule.js.map