import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { tmpdir } from 'os';
import { v4 as uuidv4 } from 'uuid';

export const AI_QUESTION_UPLOAD_LIMITS = {
  MAX_FILES: 5,
  MAX_FILE_SIZE: 15 * 1024 * 1024,
};

export const AI_QUESTION_ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'application/json',
];

export const aiQuestionMulterOptions = {
  limits: {
    fileSize: AI_QUESTION_UPLOAD_LIMITS.MAX_FILE_SIZE,
    files: AI_QUESTION_UPLOAD_LIMITS.MAX_FILES,
  },
  fileFilter: (req: any, file: Express.Multer.File, cb: any) => {
    if (!AI_QUESTION_ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(
        new BadRequestException(
          `Định dạng file ${file.originalname} không được hỗ trợ. AI chỉ đọc đề thi dạng PDF, DOCX, TXT.`,
        ),
        false,
      );
    }
    cb(null, true);
  },
  storage: diskStorage({
    destination: (req, file, cb) => {
      cb(null, tmpdir());
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-qbank-${uuidv4()}`;
      const ext = extname(file.originalname);
      cb(null, `ai_exam_${uniqueSuffix}${ext}`);
    },
  }),
};
