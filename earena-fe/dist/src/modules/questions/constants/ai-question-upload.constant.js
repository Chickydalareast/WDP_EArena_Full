"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiQuestionMulterOptions = exports.AI_QUESTION_ALLOWED_MIME_TYPES = exports.AI_QUESTION_UPLOAD_LIMITS = void 0;
const common_1 = require("@nestjs/common");
const multer_1 = require("multer");
const path_1 = require("path");
const os_1 = require("os");
const uuid_1 = require("uuid");
exports.AI_QUESTION_UPLOAD_LIMITS = {
    MAX_FILES: 5,
    MAX_FILE_SIZE: 15 * 1024 * 1024,
};
exports.AI_QUESTION_ALLOWED_MIME_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/json',
];
exports.aiQuestionMulterOptions = {
    limits: {
        fileSize: exports.AI_QUESTION_UPLOAD_LIMITS.MAX_FILE_SIZE,
        files: exports.AI_QUESTION_UPLOAD_LIMITS.MAX_FILES,
    },
    fileFilter: (req, file, cb) => {
        if (!exports.AI_QUESTION_ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            return cb(new common_1.BadRequestException(`Định dạng file ${file.originalname} không được hỗ trợ. AI chỉ đọc đề thi dạng PDF, DOCX, TXT.`), false);
        }
        cb(null, true);
    },
    storage: (0, multer_1.diskStorage)({
        destination: (req, file, cb) => {
            cb(null, (0, os_1.tmpdir)());
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = `${Date.now()}-qbank-${(0, uuid_1.v4)()}`;
            const ext = (0, path_1.extname)(file.originalname);
            cb(null, `ai_exam_${uniqueSuffix}${ext}`);
        },
    }),
};
//# sourceMappingURL=ai-question-upload.constant.js.map