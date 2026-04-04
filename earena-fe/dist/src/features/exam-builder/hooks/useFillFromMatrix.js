'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFillFromMatrix = void 0;
const react_query_1 = require("@tanstack/react-query");
const sonner_1 = require("sonner");
const exam_builder_service_1 = require("../api/exam-builder.service");
const query_keys_1 = require("../api/query-keys");
const useFillFromMatrix = (paperId) => {
    const queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: (data) => exam_builder_service_1.examBuilderService.fillFromMatrix(paperId, data),
        onSuccess: (data) => {
            sonner_1.toast.success(data.message || `Đã bốc thành công ${data.addedActualQuestions} câu hỏi mới.`);
            queryClient.invalidateQueries({
                queryKey: query_keys_1.examQueryKeys.paperDetail(paperId),
            });
        },
    });
};
exports.useFillFromMatrix = useFillFromMatrix;
//# sourceMappingURL=useFillFromMatrix.js.map