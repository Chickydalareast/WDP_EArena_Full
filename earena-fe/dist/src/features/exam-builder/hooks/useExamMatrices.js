'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useExamMatrices = void 0;
const react_query_1 = require("@tanstack/react-query");
const exam_builder_service_1 = require("../api/exam-builder.service");
const query_keys_1 = require("../api/query-keys");
const useExamMatrices = (subjectId) => {
    return (0, react_query_1.useQuery)({
        queryKey: query_keys_1.examQueryKeys.matrixList({ subjectId }),
        queryFn: () => exam_builder_service_1.examBuilderService.getMatrices({ subjectId, limit: 100 }),
        enabled: !!subjectId,
        staleTime: 5 * 60 * 1000,
    });
};
exports.useExamMatrices = useExamMatrices;
//# sourceMappingURL=useExamMatrices.js.map