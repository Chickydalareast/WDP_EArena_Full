'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAddManualQuestion = void 0;
const react_query_1 = require("@tanstack/react-query");
const sonner_1 = require("sonner");
const axios_client_1 = require("@/shared/lib/axios-client");
const api_endpoints_1 = require("@/config/api-endpoints");
const exam_builder_service_1 = require("../api/exam-builder.service");
const query_keys_1 = require("../api/query-keys");
const findFolderByName = (data, targetName) => {
    if (!data)
        return null;
    let folders = [];
    if (Array.isArray(data)) {
        folders = data;
    }
    else if (data && typeof data === 'object') {
        const resObj = data;
        if (Array.isArray(resObj.items))
            folders = resObj.items;
        else if (Array.isArray(resObj.data))
            folders = resObj.data;
    }
    if (folders.length === 0)
        return null;
    for (const folder of folders) {
        if (folder.name === targetName)
            return folder._id ?? null;
        if (Array.isArray(folder.children) && folder.children.length > 0) {
            const foundId = findFolderByName(folder.children, targetName);
            if (foundId)
                return foundId;
        }
    }
    return null;
};
const useAddManualQuestion = (paperId) => {
    const queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: async (questionData) => {
            if (!paperId || paperId === 'undefined' || paperId === 'null') {
                throw new Error('Mã đề thi (paperId) không hợp lệ. Vui lòng quay lại danh sách và vào lại.');
            }
            const folderName = `[Tự tạo ngầm] Tài nguyên của mã đề: ${paperId}`;
            let targetFolderId = '';
            const foldersResponse = await axios_client_1.axiosClient.get(api_endpoints_1.API_ENDPOINTS.QUESTION_FOLDERS.BASE);
            const existingId = findFolderByName(foldersResponse, folderName);
            if (existingId) {
                targetFolderId = existingId;
            }
            else {
                const newFolder = await axios_client_1.axiosClient.post(api_endpoints_1.API_ENDPOINTS.QUESTION_FOLDERS.BASE, {
                    name: folderName,
                    parentId: null
                });
                targetFolderId = String(newFolder.id || newFolder._id || '');
            }
            if (!targetFolderId)
                throw new Error('Không thể xác định thư mục lưu trữ');
            const LABELS = ['A', 'B', 'C', 'D'];
            const formattedAnswers = questionData.answers.map((ans, index) => ({
                id: LABELS[index],
                content: ans.content,
                isCorrect: LABELS[index] === questionData.correctAnswerId,
            }));
            const questionResponse = await axios_client_1.axiosClient.post(api_endpoints_1.API_ENDPOINTS.QUESTIONS.BASE, {
                content: questionData.content,
                answers: formattedAnswers,
                folderId: targetFolderId,
                isDraft: true,
            });
            let newQuestionId = '';
            if (questionResponse.insertedIds && Array.isArray(questionResponse.insertedIds) && questionResponse.insertedIds.length > 0) {
                newQuestionId = String(questionResponse.insertedIds[0]);
            }
            else {
                newQuestionId = String(questionResponse.id || questionResponse._id || '');
            }
            if (!newQuestionId)
                throw new Error('BE không trả về ID câu hỏi');
            await exam_builder_service_1.examBuilderService.updatePaperQuestions(paperId, {
                action: 'ADD',
                questionId: newQuestionId,
            });
            return newQuestionId;
        },
        onSuccess: () => {
            sonner_1.toast.success('Đã lưu câu hỏi vào đề!');
            queryClient.invalidateQueries({ queryKey: query_keys_1.examQueryKeys.paperDetail(paperId) });
        },
        onError: (err) => {
            const desc = 'message' in err && typeof err.message === 'string'
                ? err.message
                : 'Lỗi hệ thống không xác định';
            sonner_1.toast.error('Lỗi thao tác', { description: desc });
        }
    });
};
exports.useAddManualQuestion = useAddManualQuestion;
//# sourceMappingURL=useAddManualQuestion.js.map