'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useImportDocxToPaper = void 0;
const react_query_1 = require("@tanstack/react-query");
const sonner_1 = require("sonner");
const axios_client_1 = require("@/shared/lib/axios-client");
const api_endpoints_1 = require("@/config/api-endpoints");
const exam_builder_service_1 = require("../api/exam-builder.service");
const query_keys_1 = require("../api/query-keys");
const useImportDocxToPaper = (paperId) => {
    const queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: async ({ fileName, questions }) => {
            if (questions.length === 0)
                throw new Error('File Word không chứa câu hỏi nào hợp lệ.');
            const folderResponse = (await axios_client_1.axiosClient.post(api_endpoints_1.API_ENDPOINTS.QUESTION_FOLDERS.BASE, {
                name: `[Tài nguyên Import] ${fileName}`,
                parentId: null
            }));
            const folderId = folderResponse.id || folderResponse._id;
            const bulkResponse = (await axios_client_1.axiosClient.post(api_endpoints_1.API_ENDPOINTS.QUESTIONS.BULK_CREATE, {
                folderId: folderId,
                questions: questions
            }));
            const createdIds = bulkResponse.map((q) => q.id || q._id);
            const addPromises = createdIds.map(id => exam_builder_service_1.examBuilderService.updatePaperQuestions(paperId, {
                action: 'ADD',
                questionId: id
            }));
            await Promise.all(addPromises);
            return createdIds.length;
        },
        onSuccess: (count) => {
            sonner_1.toast.success(`Import thành công ${count} câu hỏi vào đề!`);
            queryClient.invalidateQueries({ queryKey: query_keys_1.examQueryKeys.paperDetail(paperId) });
        },
        onError: (error) => {
            sonner_1.toast.error('Import thất bại', { description: error.message });
        }
    });
};
exports.useImportDocxToPaper = useImportDocxToPaper;
//# sourceMappingURL=useImportDocxToPaper.js.map