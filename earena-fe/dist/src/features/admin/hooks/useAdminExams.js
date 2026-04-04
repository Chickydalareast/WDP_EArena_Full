"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAdminPaperDetailByExam = exports.ADMIN_EXAMS_KEY = void 0;
const react_query_1 = require("@tanstack/react-query");
const admin_service_1 = require("../api/admin.service");
exports.ADMIN_EXAMS_KEY = ['admin', 'exams'];
const useAdminPaperDetailByExam = (examId) => {
    return (0, react_query_1.useQuery)({
        queryKey: [...exports.ADMIN_EXAMS_KEY, 'paper-by-exam', examId],
        queryFn: async () => {
            if (!examId)
                throw new Error('Missing examId');
            return admin_service_1.adminService.getExamPaperDetailByExamId(examId);
        },
        enabled: !!examId,
        staleTime: 0,
    });
};
exports.useAdminPaperDetailByExam = useAdminPaperDetailByExam;
//# sourceMappingURL=useAdminExams.js.map