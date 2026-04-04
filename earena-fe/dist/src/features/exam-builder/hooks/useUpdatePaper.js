'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useUpdatePaper = void 0;
const react_query_1 = require("@tanstack/react-query");
const sonner_1 = require("sonner");
const exam_builder_service_1 = require("../api/exam-builder.service");
const query_keys_1 = require("../api/query-keys");
const useUpdatePaper = (paperId) => {
    const queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: async (payload) => {
            if (!paperId)
                throw new Error('Mất phiên làm việc. Vui lòng tải lại trang.');
            const { questionData, ...apiPayload } = payload;
            return exam_builder_service_1.examBuilderService.updatePaperQuestions(paperId, apiPayload);
        },
        onMutate: async (variables) => {
            if (!paperId)
                return { previousData: undefined };
            const queryKey = query_keys_1.examQueryKeys.paperDetail(paperId);
            await queryClient.cancelQueries({ queryKey });
            const previousData = queryClient.getQueryData(queryKey);
            queryClient.setQueryData(queryKey, (oldData) => {
                if (!oldData)
                    return oldData;
                let newQuestions = [...(oldData.questions || [])];
                if (variables.action === 'ADD') {
                    if (!variables.questionData) {
                        console.warn('[Architect Warning]: Thiếu questionData để render Optimistic UI.');
                    }
                    else {
                        const exists = newQuestions.some(q => q.originalQuestionId === variables.questionId);
                        if (!exists) {
                            newQuestions.push(variables.questionData);
                        }
                    }
                }
                else if (variables.action === 'REMOVE') {
                    newQuestions = newQuestions.filter(q => q.originalQuestionId !== variables.questionId);
                }
                else if (variables.action === 'REORDER') {
                    newQuestions.sort((a, b) => {
                        const indexA = variables.questionIds.indexOf(a.originalQuestionId);
                        const indexB = variables.questionIds.indexOf(b.originalQuestionId);
                        if (indexA === -1)
                            return 1;
                        if (indexB === -1)
                            return -1;
                        return indexA - indexB;
                    });
                }
                return {
                    ...oldData,
                    questions: newQuestions,
                };
            });
            return { previousData };
        },
        onError: (error, variables, context) => {
            if (paperId && context?.previousData) {
                queryClient.setQueryData(query_keys_1.examQueryKeys.paperDetail(paperId), context.previousData);
            }
            switch (error.statusCode) {
                case 409:
                    sonner_1.toast.error('Thao tác thất bại', { description: 'Câu hỏi này đã tồn tại trong đề thi.' });
                    break;
                case 400:
                    sonner_1.toast.error('Không thể thao tác', { description: 'Đề thi đã bị khóa hoặc dữ liệu không hợp lệ.' });
                    break;
                default:
                    sonner_1.toast.error('Mất kết nối', { description: 'Đã hoàn tác thao tác vừa rồi. Vui lòng thử lại.' });
            }
        },
        onSettled: () => {
            if (paperId) {
                queryClient.invalidateQueries({ queryKey: query_keys_1.examQueryKeys.paperDetail(paperId) });
            }
        },
    });
};
exports.useUpdatePaper = useUpdatePaper;
//# sourceMappingURL=useUpdatePaper.js.map