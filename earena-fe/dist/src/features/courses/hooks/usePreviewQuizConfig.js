"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usePreviewQuizConfig = void 0;
const react_query_1 = require("@tanstack/react-query");
const course_service_1 = require("../api/course.service");
const sonner_1 = require("sonner");
const error_parser_1 = require("@/shared/lib/error-parser");
const usePreviewQuizConfig = () => {
    return (0, react_query_1.useMutation)({
        mutationFn: (payload) => course_service_1.courseService.previewQuizConfig(payload),
        onError: (error) => {
            const parsed = (0, error_parser_1.parseApiError)(error);
            if (parsed.statusCode === 429) {
                sonner_1.toast.error('Thao tác quá nhanh!', {
                    description: 'Hệ thống đang sinh đề, vui lòng đợi 10 giây trước khi thử lại.'
                });
            }
            else {
                sonner_1.toast.error('Lỗi sinh đề mẫu', { description: parsed.message });
            }
        }
    });
};
exports.usePreviewQuizConfig = usePreviewQuizConfig;
//# sourceMappingURL=usePreviewQuizConfig.js.map