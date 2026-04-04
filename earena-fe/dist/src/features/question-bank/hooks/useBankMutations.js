'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useBulkPublishQuestions = exports.useBulkAutoTag = exports.useExecuteOrganize = exports.usePreviewOrganize = exports.useGenerateAiQuestions = exports.useCreateBankQuestions = exports.useBulkDeleteQuestions = exports.useBulkCloneQuestions = exports.useCloneQuestion = void 0;
const react_query_1 = require("@tanstack/react-query");
const sonner_1 = require("sonner");
const question_bank_service_1 = require("../api/question-bank.service");
const useBankQueries_1 = require("./useBankQueries");
const error_parser_1 = require("@/shared/lib/error-parser");
const useFolderMutations_1 = require("./useFolderMutations");
const question_bank_store_1 = require("../stores/question-bank.store");
const useCloneQuestion = () => {
    const queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: ({ id, data }) => question_bank_service_1.questionBankService.cloneQuestion(id, data),
        onSuccess: () => {
            sonner_1.toast.success('Đã nhân bản câu hỏi thành công!');
            queryClient.invalidateQueries({ queryKey: useBankQueries_1.BANK_QUESTIONS_KEY });
        },
        onError: (err) => sonner_1.toast.error('Lỗi nhân bản', { description: err.message })
    });
};
exports.useCloneQuestion = useCloneQuestion;
const useBulkCloneQuestions = () => {
    const queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: (data) => question_bank_service_1.questionBankService.bulkCloneQuestions(data),
        onSuccess: () => {
            sonner_1.toast.success('Đã nhân bản hàng loạt thành công!');
            queryClient.invalidateQueries({ queryKey: useBankQueries_1.BANK_QUESTIONS_KEY });
        },
        onError: (err) => sonner_1.toast.error('Lỗi nhân bản hàng loạt', { description: err.message })
    });
};
exports.useBulkCloneQuestions = useBulkCloneQuestions;
const useBulkDeleteQuestions = () => {
    const queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: (data) => question_bank_service_1.questionBankService.bulkDeleteQuestions(data),
        onSuccess: () => {
            sonner_1.toast.success('Đã xóa thành công các câu hỏi được chọn!');
            queryClient.invalidateQueries({ queryKey: useBankQueries_1.BANK_QUESTIONS_KEY });
        },
        onError: (err) => sonner_1.toast.error('Lỗi khi xóa', { description: err.message })
    });
};
exports.useBulkDeleteQuestions = useBulkDeleteQuestions;
const useCreateBankQuestions = () => {
    const queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: ({ folderId, questionsData }) => {
            return question_bank_service_1.questionBankService.bulkCreateQuestions({
                folderId,
                questions: questionsData
            });
        },
        onSuccess: () => {
            sonner_1.toast.success('Thành công', { description: 'Đã tạo câu hỏi và lưu vào ngân hàng!' });
            queryClient.invalidateQueries({ queryKey: useBankQueries_1.BANK_QUESTIONS_KEY });
        },
        onError: (err) => {
            const errorMessage = typeof err.message === 'string'
                ? err.message
                : JSON.stringify(err.message || 'Có lỗi xảy ra từ máy chủ');
            sonner_1.toast.error('Lỗi tạo câu hỏi', { description: errorMessage });
        }
    });
};
exports.useCreateBankQuestions = useCreateBankQuestions;
const useGenerateAiQuestions = () => {
    const queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: (data) => question_bank_service_1.questionBankService.generateAiQuestions(data),
        onSuccess: (data) => {
            sonner_1.toast.success('AI phân tích thành công!', {
                description: data.message || `Đã tự động bóc tách và tạo ${data.questionsGenerated} câu hỏi.`,
                duration: 6000,
            });
            queryClient.invalidateQueries({ queryKey: useBankQueries_1.BANK_QUESTIONS_KEY });
        },
        onError: (error) => {
            const parsedError = (0, error_parser_1.parseApiError)(error);
            const isTimeout = parsedError.statusCode === 408 || error?.toString().includes('timeout');
            sonner_1.toast.error(isTimeout ? 'AI đang quá tải (Timeout)' : 'Quá trình phân tích thất bại', {
                description: isTimeout
                    ? 'Đề thi của bạn quá dài hoặc hệ thống LLM đang bị nghẽn. Vui lòng cắt nhỏ đề thi và thử lại.'
                    : parsedError.message,
                duration: 8000,
            });
        },
    });
};
exports.useGenerateAiQuestions = useGenerateAiQuestions;
const usePreviewOrganize = () => {
    return (0, react_query_1.useMutation)({
        mutationFn: (data) => question_bank_service_1.questionBankService.previewAutoOrganize(data),
        onError: (err) => {
            if (err.statusCode === 400) {
                sonner_1.toast.error('Dữ liệu không hợp lệ', {
                    description: err.message || 'Các câu hỏi chọn có thể thiếu thuộc tính Chuyên đề/Độ khó.'
                });
            }
            else if (err.statusCode === 403) {
                sonner_1.toast.error('Thiếu cấu hình', {
                    description: 'Vui lòng cập nhật Môn học đang giảng dạy trong Profile trước khi dùng tính năng này.'
                });
            }
            else {
                sonner_1.toast.error('Lỗi mô phỏng', { description: err.message });
            }
        }
    });
};
exports.usePreviewOrganize = usePreviewOrganize;
const useExecuteOrganize = () => {
    const queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: (data) => question_bank_service_1.questionBankService.executeAutoOrganize(data),
        onSuccess: (res) => {
            sonner_1.toast.success('Tổ chức thành công!', { description: res.message });
            queryClient.invalidateQueries({ queryKey: useFolderMutations_1.FOLDER_QUERY_KEY });
            queryClient.invalidateQueries({ queryKey: useBankQueries_1.BANK_QUESTIONS_KEY });
        },
        onError: (err) => {
            sonner_1.toast.error('Lỗi thực thi sắp xếp', { description: err.message });
        }
    });
};
exports.useExecuteOrganize = useExecuteOrganize;
const useBulkAutoTag = () => {
    return (0, react_query_1.useMutation)({
        mutationFn: (data) => question_bank_service_1.questionBankService.bulkAutoTag(data),
        onSuccess: (_, variables) => {
            const store = question_bank_store_1.useQuestionBankStore.getState();
            store.addProcessingIds(variables.questionIds);
            store.clearQuestionSelection();
            sonner_1.toast.success('Hệ thống đang xử lý ngầm!', {
                description: 'Yêu cầu AI phân loại đã được đưa vào hàng đợi. Quá trình này có thể mất vài phút.',
                duration: 5000,
            });
        },
        onError: (err) => {
            sonner_1.toast.error('Không thể thực hiện yêu cầu', {
                description: err.message || 'Lỗi kết nối hoặc tài khoản không hợp lệ.'
            });
        }
    });
};
exports.useBulkAutoTag = useBulkAutoTag;
const useBulkPublishQuestions = () => {
    const queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: (data) => question_bank_service_1.questionBankService.bulkPublishQuestions(data),
        onSuccess: (data) => {
            sonner_1.toast.success('Xuất bản thành công', {
                description: `Đã chuyển ${data.publishedCount} câu hỏi sang trạng thái Chính thức.`
            });
            queryClient.invalidateQueries({ queryKey: useBankQueries_1.BANK_QUESTIONS_KEY });
        },
        onError: (err) => {
            sonner_1.toast.error('Không thể xuất bản', {
                description: err.message || 'Đã có lỗi xảy ra khi kiểm tra dữ liệu.'
            });
        }
    });
};
exports.useBulkPublishQuestions = useBulkPublishQuestions;
//# sourceMappingURL=useBankMutations.js.map