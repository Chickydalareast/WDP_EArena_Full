'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useInitExam = void 0;
const react_query_1 = require("@tanstack/react-query");
const navigation_1 = require("next/navigation");
const sonner_1 = require("sonner");
const exam_builder_service_1 = require("../api/exam-builder.service");
const useInitExam = () => {
    const router = (0, navigation_1.useRouter)();
    return (0, react_query_1.useMutation)({
        mutationFn: exam_builder_service_1.examBuilderService.initExam,
        onSuccess: (data) => {
            sonner_1.toast.success('Khởi tạo vỏ đề thi thành công', {
                description: 'Đang chuyển hướng đến không gian soạn thảo...',
            });
            router.push(`/teacher/exams/${data.examId}/builder?paperId=${data.paperId}`);
        },
        onError: (error) => {
            sonner_1.toast.error('Không thể khởi tạo đề thi', {
                description: error.message || 'Lỗi hệ thống. Vui lòng thử lại.',
            });
        },
    });
};
exports.useInitExam = useInitExam;
//# sourceMappingURL=useInitExam.js.map