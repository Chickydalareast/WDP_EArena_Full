'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useUpdatePoints = void 0;
const react_query_1 = require("@tanstack/react-query");
const sonner_1 = require("sonner");
const exam_builder_service_1 = require("../api/exam-builder.service");
const query_keys_1 = require("../api/query-keys");
const useUpdatePoints = (paperId) => {
    const queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: (data) => exam_builder_service_1.examBuilderService.updatePoints(paperId, data),
        onSuccess: () => {
            sonner_1.toast.success('Đã lưu điểm số thành công.');
            queryClient.invalidateQueries({
                queryKey: query_keys_1.examQueryKeys.paperDetail(paperId),
            });
        },
        onError: (error) => {
            sonner_1.toast.error('Lỗi lưu điểm', { description: error.message });
        }
    });
};
exports.useUpdatePoints = useUpdatePoints;
//# sourceMappingURL=useUpdatePoints.js.map