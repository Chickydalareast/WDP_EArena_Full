'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useGenerateExam = void 0;
const react_query_1 = require("@tanstack/react-query");
const navigation_1 = require("next/navigation");
const sonner_1 = require("sonner");
const exam_builder_service_1 = require("../api/exam-builder.service");
const routes_1 = require("@/config/routes");
const useGenerateExam = () => {
    const router = (0, navigation_1.useRouter)();
    return (0, react_query_1.useMutation)({
        mutationFn: exam_builder_service_1.examBuilderService.generateExam,
        onSuccess: (data) => {
            sonner_1.toast.success(`Thành công! Đã tạo đề thi gồm ${data.totalActualQuestions} câu hỏi (Tương đương ${data.totalItems} khối hiển thị).`);
            router.push(`${routes_1.ROUTES.TEACHER.EXAMS}/${data.examId}/builder?paperId=${data.examPaperId}`);
        },
        onError: (error) => {
            if (error?.statusCode === 400 && error?.message) {
                sonner_1.toast.error('Lỗi Ma Trận Sinh Đề', {
                    description: error.message,
                    duration: 8000,
                });
            }
            else {
                sonner_1.toast.error('Có lỗi xảy ra', { description: error?.message || 'Không thể sinh đề lúc này' });
            }
        },
    });
};
exports.useGenerateExam = useGenerateExam;
//# sourceMappingURL=useGenerateExam.js.map