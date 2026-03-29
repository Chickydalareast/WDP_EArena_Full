import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { tmpdir } from 'os';
import { v4 as uuidv4 } from 'uuid';

export const AI_UPLOAD_LIMITS = {
    MAX_FILES: 5,
    MAX_FILE_SIZE: 15 * 1024 * 1024, // 15MB/file
};

export const AI_ALLOWED_MIME_TYPES = [
    'application/pdf', // PDF
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
    'text/plain', // TXT
    'application/json', // JSON
];

export const aiMulterOptions = {
    limits: {
        fileSize: AI_UPLOAD_LIMITS.MAX_FILE_SIZE,
        files: AI_UPLOAD_LIMITS.MAX_FILES,
    },
    fileFilter: (req: any, file: Express.Multer.File, cb: any) => {
        if (!AI_ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            return cb(
                new BadRequestException(
                    `Định dạng file ${file.originalname} không được hỗ trợ. AI chỉ đọc tài liệu text (PDF, DOCX, TXT, JSON).`
                ),
                false
            );
        }
        cb(null, true);
    },
    storage: diskStorage({
        destination: (req, file, cb) => {
            cb(null, tmpdir());
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = `${Date.now()}-${uuidv4()}`;
            const ext = extname(file.originalname);
            cb(null, `ai_doc_${uniqueSuffix}${ext}`);
        },
    }),
};