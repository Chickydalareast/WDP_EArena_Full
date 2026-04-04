"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BulkPublishQuestionsSchema = exports.BulkAutoTagSchema = exports.OrganizeQuestionsPayloadSchema = exports.OrganizeStrategyEnum = exports.AiQuestionBuilderSchema = exports.BulkDeleteQuestionsSchema = exports.BulkCloneQuestionsSchema = exports.CloneQuestionSchema = exports.BulkMoveQuestionsSchema = exports.FolderPayloadSchema = void 0;
const zod_1 = require("zod");
exports.FolderPayloadSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Tên thư mục không được để trống'),
    description: zod_1.z.string().optional(),
    parentId: zod_1.z.string().nullable().optional(),
});
exports.BulkMoveQuestionsSchema = zod_1.z.object({
    questionIds: zod_1.z.array(zod_1.z.string()).min(1, 'Phải chọn ít nhất 1 câu hỏi'),
    destFolderId: zod_1.z.string().min(1, 'Vui lòng chọn thư mục đích'),
});
exports.CloneQuestionSchema = zod_1.z.object({
    destFolderId: zod_1.z.string().min(1, 'Vui lòng chọn thư mục đích'),
});
exports.BulkCloneQuestionsSchema = zod_1.z.object({
    questionIds: zod_1.z.array(zod_1.z.string()).min(1, 'Phải chọn ít nhất 1 câu hỏi'),
    destFolderId: zod_1.z.string().min(1, 'Vui lòng chọn thư mục đích'),
});
exports.BulkDeleteQuestionsSchema = zod_1.z.object({
    questionIds: zod_1.z.array(zod_1.z.string()).min(1, 'Phải chọn ít nhất 1 câu hỏi để xóa'),
});
const MAX_FILE_SIZE = 15 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
];
exports.AiQuestionBuilderSchema = zod_1.z.object({
    files: zod_1.z.array(zod_1.z.custom((val) => val instanceof File, 'Định dạng tệp không hợp lệ'))
        .min(1, 'Vui lòng chọn ít nhất 1 tài liệu đề thi để AI phân tích')
        .max(5, 'Chỉ được phép chọn tối đa 5 tài liệu cùng lúc')
        .refine((files) => files.every((file) => file.size <= MAX_FILE_SIZE), 'Dung lượng mỗi tài liệu không được vượt quá 15MB')
        .refine((files) => files.every((file) => {
        const extension = file.name.split('.').pop()?.toLowerCase();
        return ACCEPTED_FILE_TYPES.includes(file.type) || ['pdf', 'docx', 'txt'].includes(extension || '');
    }), 'Hệ thống chỉ hỗ trợ định dạng .pdf, .docx, và .txt'),
    folderId: zod_1.z.string().min(1, 'Hệ thống bị lỗi nhận dạng Thư mục lưu trữ'),
    additionalInstructions: zod_1.z.string()
        .max(2000, 'Lời dặn dò không được vượt quá 2000 ký tự')
        .optional(),
});
exports.OrganizeStrategyEnum = zod_1.z.enum(['TOPIC_STRICT', 'TOPIC_AND_DIFFICULTY', 'FLAT_DIFFICULTY']);
exports.OrganizeQuestionsPayloadSchema = zod_1.z.object({
    questionIds: zod_1.z.array(zod_1.z.string()).min(1, 'Phải chọn ít nhất 1 câu hỏi để tổ chức'),
    strategy: exports.OrganizeStrategyEnum,
    baseFolderId: zod_1.z.string().optional(),
});
exports.BulkAutoTagSchema = zod_1.z.object({
    questionIds: zod_1.z.array(zod_1.z.string()).min(1, 'Phải chọn ít nhất 1 câu hỏi').max(200, 'Chỉ được xử lý tối đa 200 câu hỏi mỗi lần'),
});
exports.BulkPublishQuestionsSchema = zod_1.z.object({
    questionIds: zod_1.z.array(zod_1.z.string()).min(1, 'Phải chọn ít nhất 1 câu hỏi để xuất bản'),
});
//# sourceMappingURL=question-bank.schema.js.map