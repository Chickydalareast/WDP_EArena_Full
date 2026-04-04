'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useBulkMoveQuestions = exports.useBankQuestions = exports.useFolderTree = exports.SUGGEST_FOLDERS_KEY = exports.BANK_QUESTIONS_KEY = void 0;
const react_query_1 = require("@tanstack/react-query");
const sonner_1 = require("sonner");
const question_bank_service_1 = require("../api/question-bank.service");
const useFolderMutations_1 = require("./useFolderMutations");
exports.BANK_QUESTIONS_KEY = ['question-bank', 'questions'];
exports.SUGGEST_FOLDERS_KEY = ['question-bank', 'suggest-folders'];
const useFolderTree = () => {
    return (0, react_query_1.useQuery)({
        queryKey: useFolderMutations_1.FOLDER_QUERY_KEY,
        queryFn: () => question_bank_service_1.questionBankService.getFolderTree(),
        staleTime: 5 * 60 * 1000,
    });
};
exports.useFolderTree = useFolderTree;
const useBankQuestions = (params, isPollingActive = false) => {
    return (0, react_query_1.useQuery)({
        queryKey: [...exports.BANK_QUESTIONS_KEY, params],
        queryFn: () => question_bank_service_1.questionBankService.getQuestionsByFolder(params),
        staleTime: 60 * 1000,
        enabled: !!params.folderIds && params.folderIds.length > 0,
        refetchInterval: isPollingActive ? 15000 : false,
        refetchIntervalInBackground: isPollingActive,
    });
};
exports.useBankQuestions = useBankQuestions;
const useBulkMoveQuestions = () => {
    const queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: (data) => question_bank_service_1.questionBankService.bulkMoveQuestions(data),
        onSuccess: () => {
            sonner_1.toast.success('Di chuyển thành công!');
            queryClient.invalidateQueries({ queryKey: exports.BANK_QUESTIONS_KEY });
        },
        onError: (err) => {
            sonner_1.toast.error('Lỗi di chuyển', { description: err.message });
        }
    });
};
exports.useBulkMoveQuestions = useBulkMoveQuestions;
//# sourceMappingURL=useBankQueries.js.map