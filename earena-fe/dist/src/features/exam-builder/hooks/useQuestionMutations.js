'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useUpdatePassageQuestion = exports.useUpdateSingleQuestion = exports.useDeleteQuestion = exports.useAddBulkManual = void 0;
const react_query_1 = require("@tanstack/react-query");
const sonner_1 = require("sonner");
const exam_builder_service_1 = require("../api/exam-builder.service");
const query_keys_1 = require("../api/query-keys");
const useAddBulkManual = (paperId) => {
    const queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: async ({ questionsData, folderId }) => {
            if (!folderId)
                throw new Error('Không tìm thấy ID Thư mục lưu trữ của mã đề này!');
            const bulkResponse = await exam_builder_service_1.examBuilderService.bulkCreateQuestionsAndReturnIds({
                folderId: folderId,
                questions: questionsData
            });
            let createdRootIds = [];
            const extractRootIds = (arr) => {
                return arr.map(item => {
                    if (typeof item === 'string')
                        return item;
                    if (typeof item === 'object' && item !== null) {
                        const q = item;
                        if (q.parentPassageId)
                            return '';
                        return String(q._id || q.id || '');
                    }
                    return '';
                }).filter(id => id !== '');
            };
            if (Array.isArray(bulkResponse)) {
                createdRootIds = extractRootIds(bulkResponse);
            }
            else if (typeof bulkResponse === 'object' && bulkResponse !== null) {
                const resObj = bulkResponse;
                if (Array.isArray(resObj.insertedIds))
                    createdRootIds = extractRootIds(resObj.insertedIds);
                else if (Array.isArray(resObj.data))
                    createdRootIds = extractRootIds(resObj.data);
                else if (Array.isArray(resObj.items))
                    createdRootIds = extractRootIds(resObj.items);
            }
            if (createdRootIds.length === 0) {
                throw new Error('Hệ thống tạo thành công nhưng không trả về ID. Vui lòng tải lại trang.');
            }
            const results = await Promise.allSettled(createdRootIds.map((id) => exam_builder_service_1.examBuilderService.updatePaperQuestions(paperId, { action: 'ADD', questionId: id })));
            const successCount = results.filter(r => r.status === 'fulfilled').length;
            if (successCount === 0) {
                throw new Error('Không thể chèn bất kỳ câu hỏi nào vào đề thi. Vui lòng thử lại.');
            }
            return successCount;
        },
        onSuccess: () => {
            sonner_1.toast.success('Đã lưu câu hỏi vào đề!');
            queryClient.invalidateQueries({ queryKey: query_keys_1.examQueryKeys.paperDetail(paperId) });
        },
        onError: (err) => {
            const errorMessage = 'message' in err && typeof err.message === 'string'
                ? err.message
                : 'Có lỗi xảy ra khi lưu vào vỏ đề';
            sonner_1.toast.error('Lỗi khi lưu câu hỏi', { description: errorMessage });
        }
    });
};
exports.useAddBulkManual = useAddBulkManual;
const useDeleteQuestion = (paperId) => {
    const queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: (questionId) => exam_builder_service_1.examBuilderService.deleteQuestion(questionId),
        onSuccess: () => {
            sonner_1.toast.success('Đã xóa vĩnh viễn câu hỏi khỏi hệ thống!');
            queryClient.invalidateQueries({ queryKey: query_keys_1.examQueryKeys.paperDetail(paperId) });
        },
        onError: (err) => sonner_1.toast.error('Lỗi xóa câu hỏi', { description: err.message })
    });
};
exports.useDeleteQuestion = useDeleteQuestion;
const useUpdateSingleQuestion = (context) => {
    const queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: ({ questionId, payload }) => exam_builder_service_1.examBuilderService.updateSingleQuestion(questionId, payload),
        onSuccess: () => {
            setTimeout(() => {
                if (context?.paperId)
                    queryClient.invalidateQueries({ queryKey: query_keys_1.examQueryKeys.paperDetail(context.paperId) });
                if (context?.isBankMode)
                    queryClient.invalidateQueries({ queryKey: ['question-bank', 'questions'] });
            }, 500);
            sonner_1.toast.success('Đã lưu câu hỏi!');
        },
        onError: (err) => sonner_1.toast.error('Lỗi lưu câu hỏi', { description: err.message })
    });
};
exports.useUpdateSingleQuestion = useUpdateSingleQuestion;
const useUpdatePassageQuestion = (context) => {
    const queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: ({ passageId, payload }) => exam_builder_service_1.examBuilderService.updatePassageQuestion(passageId, payload),
        onSuccess: () => {
            setTimeout(() => {
                if (context?.paperId)
                    queryClient.invalidateQueries({ queryKey: query_keys_1.examQueryKeys.paperDetail(context.paperId) });
                if (context?.isBankMode)
                    queryClient.invalidateQueries({ queryKey: ['question-bank', 'questions'] });
            }, 500);
            sonner_1.toast.success('Đã lưu toàn bộ Bài đọc!');
        },
        onError: (err) => sonner_1.toast.error('Lỗi', { description: err.message })
    });
};
exports.useUpdatePassageQuestion = useUpdatePassageQuestion;
//# sourceMappingURL=useQuestionMutations.js.map