"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateQuizLessonSchema = exports.CreateQuizLessonSchema = exports.updateLessonSchema = exports.DynamicConfigSchema = exports.aiBuilderFormSchema = exports.updateSectionSchema = exports.createLessonSchema = exports.createSectionSchema = exports.ExamRuleSchema = void 0;
const zod_1 = require("zod");
const exam_schema_1 = require("@/features/exam-builder/types/exam.schema");
exports.ExamRuleSchema = zod_1.z.object({
    timeLimit: zod_1.z.number().min(0, 'Thời gian làm bài không được âm').default(45),
    maxAttempts: zod_1.z.number().min(1, 'Số lần làm bài tối thiểu là 1').default(1),
    passPercentage: zod_1.z.number().min(0).max(100, 'Điểm chuẩn không vượt quá 100%').default(50),
    showResultMode: zod_1.z.enum(['IMMEDIATELY', 'AFTER_END_TIME', 'NEVER']).default('IMMEDIATELY'),
});
exports.createSectionSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Tên chương/phần không được để trống'),
    description: zod_1.z.string().optional(),
});
exports.createLessonSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Tên bài học không được để trống'),
    isFreePreview: zod_1.z.boolean().default(false),
    content: zod_1.z.string().optional(),
    primaryVideoId: zod_1.z.string().optional(),
    examId: zod_1.z.string().optional(),
    examRules: exports.ExamRuleSchema.optional(),
    attachments: zod_1.z.array(zod_1.z.string()).default([]),
}).superRefine((data, ctx) => {
    const hasContent = data.content && data.content.trim() !== '' && data.content !== '<p></p>';
    const hasVideo = !!data.primaryVideoId;
    const hasExam = !!data.examId;
    const hasAttachments = data.attachments && data.attachments.length > 0;
    if (!hasContent && !hasVideo && !hasExam && !hasAttachments) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            path: ['title'],
            message: 'Bài học không được để trống. Vui lòng nhập nội dung, đính kèm video, bài thi hoặc tài liệu.',
        });
    }
    if (hasExam && !data.examRules) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            path: ['examRules'],
            message: 'Vui lòng cấu hình luật thi (Exam Rules) cho bài trắc nghiệm.',
        });
    }
});
exports.updateSectionSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Tên chương không được để trống').optional(),
    description: zod_1.z.string().optional(),
});
const MAX_FILE_SIZE = 15 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
];
exports.aiBuilderFormSchema = zod_1.z.object({
    files: zod_1.z.array(zod_1.z.custom((val) => val instanceof File, 'Định dạng tệp không hợp lệ'))
        .min(1, 'Vui lòng chọn ít nhất 1 tài liệu để AI phân tích')
        .max(5, 'Chỉ được phép chọn tối đa 5 tài liệu cùng lúc')
        .refine((files) => files.every((file) => file.size <= MAX_FILE_SIZE), 'Dung lượng mỗi tài liệu không được vượt quá 15MB')
        .refine((files) => files.every((file) => {
        const extension = file.name.split('.').pop()?.toLowerCase();
        return ACCEPTED_FILE_TYPES.includes(file.type) || ['pdf', 'docx', 'txt'].includes(extension || '');
    }), 'Hệ thống chỉ hỗ trợ định dạng .pdf, .docx, và .txt'),
    targetSectionCount: zod_1.z.preprocess((val) => (val === '' || val === null ? undefined : Number(val)), zod_1.z.number()
        .min(1, 'Số lượng chương tối thiểu là 1')
        .max(50, 'Số lượng chương tối đa là 50')
        .optional()),
    additionalInstructions: zod_1.z.string()
        .max(2000, 'Lời dặn dò không được vượt quá 2000 ký tự')
        .optional(),
});
exports.DynamicConfigSchema = zod_1.z.object({
    matrixId: zod_1.z.string().optional(),
    adHocSections: zod_1.z.array(exam_schema_1.MatrixSectionSchema).optional(),
}).refine(data => data.matrixId || (data.adHocSections && data.adHocSections.length > 0), {
    message: 'Bắt buộc phải chọn Ma trận mẫu hoặc tự tạo Luật bốc đề.',
    path: ['adHocSections']
});
exports.updateLessonSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Tên bài học không được để trống').optional(),
    isFreePreview: zod_1.z.boolean().optional(),
    content: zod_1.z.string().optional(),
    primaryVideoId: zod_1.z.string().optional(),
    examId: zod_1.z.string().optional(),
    examRules: exports.ExamRuleSchema.optional(),
    attachments: zod_1.z.array(zod_1.z.string()).optional(),
    dynamicConfig: exports.DynamicConfigSchema.optional(),
});
exports.CreateQuizLessonSchema = zod_1.z.object({
    courseId: zod_1.z.string().min(1, 'Thiếu ID Khóa học'),
    sectionId: zod_1.z.string().min(1, 'Thiếu ID Chương học'),
    title: zod_1.z.string().min(1, 'Tên bài kiểm tra không được để trống'),
    content: zod_1.z.string().optional(),
    isFreePreview: zod_1.z.boolean().default(false),
    totalScore: zod_1.z.number().min(1).default(10),
    dynamicConfig: exports.DynamicConfigSchema,
    examRules: exports.ExamRuleSchema,
});
exports.UpdateQuizLessonSchema = exports.CreateQuizLessonSchema.partial().extend({
    lessonId: zod_1.z.string().min(1, 'Thiếu ID Bài học cần cập nhật'),
});
//# sourceMappingURL=curriculum.schema.js.map