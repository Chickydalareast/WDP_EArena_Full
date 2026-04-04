'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAssignExam = void 0;
const react_query_1 = require("@tanstack/react-query");
const sonner_1 = require("sonner");
const useAssignExam = () => {
    return (0, react_query_1.useMutation)({
        mutationFn: async (payload) => {
            return new Promise((resolve) => setTimeout(resolve, 300));
        },
        onSuccess: () => {
            sonner_1.toast.info('Tính năng giao đề đang được nâng cấp sang hệ thống Khóa Học.');
        },
        onError: () => {
            sonner_1.toast.error('Hệ thống đang bảo trì, vui lòng thử lại sau.');
        }
    });
};
exports.useAssignExam = useAssignExam;
//# sourceMappingURL=useAssignExam.js.map