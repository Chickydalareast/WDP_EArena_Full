'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDeleteFolder = exports.useUpdateFolder = exports.useCreateFolder = exports.FOLDER_QUERY_KEY = void 0;
const react_query_1 = require("@tanstack/react-query");
const sonner_1 = require("sonner");
const question_bank_service_1 = require("../api/question-bank.service");
exports.FOLDER_QUERY_KEY = ['question-folders', 'tree'];
const useCreateFolder = () => {
    const queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: (data) => question_bank_service_1.questionBankService.createFolder(data),
        onSuccess: () => {
            sonner_1.toast.success('Tạo thư mục thành công');
            queryClient.invalidateQueries({ queryKey: exports.FOLDER_QUERY_KEY });
        },
        onError: (err) => {
            sonner_1.toast.error('Lỗi tạo thư mục', { description: err.message });
        }
    });
};
exports.useCreateFolder = useCreateFolder;
const useUpdateFolder = () => {
    const queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: ({ id, data }) => question_bank_service_1.questionBankService.updateFolder(id, data),
        onSuccess: () => {
            sonner_1.toast.success('Cập nhật thư mục thành công');
            queryClient.invalidateQueries({ queryKey: exports.FOLDER_QUERY_KEY });
        },
        onError: (err) => {
            if (err.statusCode === 400) {
                sonner_1.toast.error('Thao tác không hợp lệ', { description: 'Không thể di chuyển thư mục vào chính nó.' });
            }
            else if (err.statusCode === 409) {
                sonner_1.toast.error('Xung đột dữ liệu', { description: 'Không thể di chuyển thư mục cha vào bên trong thư mục con của nó.' });
            }
            else {
                sonner_1.toast.error('Lỗi cập nhật', { description: err.message });
            }
        }
    });
};
exports.useUpdateFolder = useUpdateFolder;
const useDeleteFolder = () => {
    const queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: (id) => question_bank_service_1.questionBankService.deleteFolder(id),
        onSuccess: () => {
            sonner_1.toast.success('Đã xóa thư mục');
            queryClient.invalidateQueries({ queryKey: exports.FOLDER_QUERY_KEY });
        },
        onError: (err) => {
            if (err.statusCode === 409) {
                sonner_1.toast.error('Không thể xóa thư mục!', {
                    description: 'Thư mục này đang chứa câu hỏi hoặc thư mục con. Vui lòng di chuyển hoặc xóa hết dữ liệu bên trong trước.',
                    duration: 5000,
                });
            }
            else {
                sonner_1.toast.error('Lỗi khi xóa', { description: err.message });
            }
        }
    });
};
exports.useDeleteFolder = useDeleteFolder;
//# sourceMappingURL=useFolderMutations.js.map