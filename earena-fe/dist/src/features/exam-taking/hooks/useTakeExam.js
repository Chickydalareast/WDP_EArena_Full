'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useExamReview = exports.useExamResultPolling = exports.useSubmitExam = exports.useAutoSave = exports.useStartExam = void 0;
const react_query_1 = require("@tanstack/react-query");
const axios_client_1 = require("@/shared/lib/axios-client");
const api_endpoints_1 = require("@/config/api-endpoints");
const sonner_1 = require("sonner");
const useStartExam = () => {
    return (0, react_query_1.useMutation)({
        mutationFn: async (payload) => {
            if (!payload.courseId || !payload.lessonId) {
                throw new Error('Thiếu định danh bài học hoặc khóa học');
            }
            const response = await axios_client_1.axiosClient.post(api_endpoints_1.API_ENDPOINTS.EXAM_TAKING.START, payload);
            return response?.data?.data || response?.data || response;
        },
        onError: (error) => {
            sonner_1.toast.error('Lỗi không gian thi', {
                description: error?.response?.data?.message || error.message || 'Không thể bắt đầu'
            });
        }
    });
};
exports.useStartExam = useStartExam;
const useAutoSave = (submissionId) => {
    return (0, react_query_1.useMutation)({
        mutationFn: async (payload) => {
            if (!submissionId)
                throw new Error('Mất phiên Session');
            return axios_client_1.axiosClient.patch(api_endpoints_1.API_ENDPOINTS.EXAM_TAKING.AUTO_SAVE(submissionId), payload);
        },
        retry: 3,
        retryDelay: 1500,
        onError: () => sonner_1.toast.error('Mất kết nối mạng! Hệ thống đang cố gắng lưu lại...'),
    });
};
exports.useAutoSave = useAutoSave;
const useSubmitExam = (submissionId) => {
    return (0, react_query_1.useMutation)({
        mutationFn: async () => {
            if (!submissionId)
                throw new Error('Mất phiên Session');
            return axios_client_1.axiosClient.post(api_endpoints_1.API_ENDPOINTS.EXAM_TAKING.SUBMIT(submissionId));
        }
    });
};
exports.useSubmitExam = useSubmitExam;
const useExamResultPolling = (submissionId, isEnabled) => {
    return (0, react_query_1.useQuery)({
        queryKey: ['exam-result', submissionId],
        queryFn: async () => {
            const response = await axios_client_1.axiosClient.get(api_endpoints_1.API_ENDPOINTS.EXAM_TAKING.RESULT(submissionId));
            const result = response?.data?.data || response?.data || response;
            return result ?? null;
        },
        enabled: !!submissionId && isEnabled,
        refetchInterval: (query) => {
            const currentData = query.state.data;
            if (currentData?.status === 'GRADING_IN_PROGRESS')
                return 2500;
            return false;
        },
    });
};
exports.useExamResultPolling = useExamResultPolling;
const useExamReview = (submissionId) => {
    return (0, react_query_1.useQuery)({
        queryKey: ['exam-review', submissionId],
        queryFn: async () => {
            const response = await axios_client_1.axiosClient.get(api_endpoints_1.API_ENDPOINTS.EXAM_TAKING.RESULT(submissionId));
            return response?.data?.data || response?.data || response;
        },
        enabled: !!submissionId,
        refetchInterval: (query) => {
            const data = query.state.data;
            if (data?.status === 'GRADING_IN_PROGRESS') {
                return data.retryAfter || 2000;
            }
            return false;
        },
        refetchOnWindowFocus: false,
    });
};
exports.useExamReview = useExamReview;
//# sourceMappingURL=useTakeExam.js.map