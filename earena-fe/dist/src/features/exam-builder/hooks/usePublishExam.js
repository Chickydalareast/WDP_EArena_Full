'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usePublishExam = void 0;
const react_query_1 = require("@tanstack/react-query");
const sonner_1 = require("sonner");
const exam_builder_service_1 = require("../api/exam-builder.service");
const query_keys_1 = require("../api/query-keys");
const usePublishExam = (paperId) => {
    const queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: async (examId) => {
            return exam_builder_service_1.examBuilderService.publishExam(examId);
        },
        onSuccess: (data) => {
            sonner_1.toast.success('Chốt đề thi thành công!', {
                description: data.message || 'Đề thi đã được khóa và sẵn sàng đưa vào bài học.',
            });
            queryClient.invalidateQueries({ queryKey: query_keys_1.examQueryKeys.paperDetail(paperId) });
        },
        onError: (error) => {
            sonner_1.toast.error('Lỗi chốt đề', {
                description: error.message || 'Đề thi đã bị khóa hoặc hệ thống đang bận.'
            });
        },
    });
};
exports.usePublishExam = usePublishExam;
//# sourceMappingURL=usePublishExam.js.map