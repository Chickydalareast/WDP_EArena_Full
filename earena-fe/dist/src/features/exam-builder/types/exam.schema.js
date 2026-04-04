"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamicPreviewRequestSchema = exports.ActiveFiltersPayloadSchema = exports.UpdatePointsSchema = exports.FillFromMatrixFormSchema = exports.MatrixSectionSchema = exports.MatrixRuleSchema = exports.GenerateExamFormSchema = exports.GenerateExamSchema = exports.MatrixCriterionSchema = exports.EditQuestionFormSchema = exports.UpdatePassageSchema = exports.EditSubQuestionSchema = exports.UpdateSingleQuestionSchema = exports.BulkCreateQuestionZodSchema = exports.QuestionItemSchema = exports.BaseQuestionItemSchema = exports.SubQuestionSchema = exports.AnswerOptionSchema = exports.UpdatePaperSchema = exports.InitExamSchema = void 0;
const zod_1 = require("zod");
exports.InitExamSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Tiêu đề không được để trống'),
    description: zod_1.z.string().optional(),
    totalScore: zod_1.z.number().min(0, 'Tổng điểm không hợp lệ'),
    subjectId: zod_1.z.string().min(1, 'Vui lòng chọn môn học cho đề thi này'),
});
exports.UpdatePaperSchema = zod_1.z.discriminatedUnion('action', [
    zod_1.z.object({
        action: zod_1.z.enum(['ADD', 'REMOVE']),
        questionId: zod_1.z.string().min(1, 'Thiếu ID câu hỏi'),
    }),
    zod_1.z.object({
        action: zod_1.z.literal('REORDER'),
        questionIds: zod_1.z.array(zod_1.z.string()).min(1, 'Danh sách thứ tự không được rỗng'),
    })
]);
exports.AnswerOptionSchema = zod_1.z.object({
    id: zod_1.z.string().min(1, 'ID đáp án không hợp lệ'),
    content: zod_1.z.string().min(1, 'Nội dung đáp án không được trống'),
    isCorrect: zod_1.z.boolean(),
});
exports.SubQuestionSchema = zod_1.z.object({
    content: zod_1.z.string().min(5, 'Nội dung câu hỏi con quá ngắn'),
    explanation: zod_1.z.string().optional(),
    difficultyLevel: zod_1.z.enum(['NB', 'TH', 'VD', 'VDC', 'UNKNOWN']).default('UNKNOWN'),
    answers: zod_1.z.array(exports.AnswerOptionSchema).min(2, 'Phải có ít nhất 2 đáp án'),
    attachedMedia: zod_1.z.array(zod_1.z.string()).default([]),
});
const BaseQuestionShape = {
    type: zod_1.z.enum(['MULTIPLE_CHOICE', 'PASSAGE']),
    content: zod_1.z.string().min(5, 'Nội dung quá ngắn'),
    explanation: zod_1.z.string().optional(),
    topicId: zod_1.z.string().optional(),
    isDraft: zod_1.z.boolean().default(true),
    difficultyLevel: zod_1.z.enum(['NB', 'TH', 'VD', 'VDC', 'UNKNOWN']).default('UNKNOWN'),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    answers: zod_1.z.array(exports.AnswerOptionSchema).optional(),
    subQuestions: zod_1.z.array(exports.SubQuestionSchema).optional(),
    attachedMedia: zod_1.z.array(zod_1.z.string()).default([]),
};
exports.BaseQuestionItemSchema = zod_1.z.object(BaseQuestionShape);
const validateQuestionLogic = (data, ctx) => {
    if (data.type === 'PASSAGE') {
        if (!data.subQuestions || data.subQuestions.length === 0) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: 'Đoạn văn (PASSAGE) phải có ít nhất 1 câu hỏi con.',
                path: ['subQuestions'],
            });
        }
        if (data.answers && data.answers.length > 0) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: 'Đoạn văn mẹ không được chứa đáp án trực tiếp.',
                path: ['answers'],
            });
        }
    }
    else if (data.type === 'MULTIPLE_CHOICE') {
        if (!data.answers || data.answers.length < 2) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: 'Câu hỏi trắc nghiệm phải có ít nhất 2 đáp án.',
                path: ['answers'],
            });
        }
    }
    if (data.isDraft === false) {
        if (!data.topicId || data.topicId.trim() === '') {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: 'Bắt buộc chọn Chuyên đề khi Xuất bản câu hỏi.',
                path: ['topicId']
            });
        }
        if (data.difficultyLevel === 'UNKNOWN') {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: 'Bắt buộc chọn Độ khó cụ thể (không được để "Chưa xác định").',
                path: ['difficultyLevel']
            });
        }
        if (data.type === 'PASSAGE' && data.subQuestions) {
            data.subQuestions.forEach((subQ, index) => {
                if (subQ.difficultyLevel === 'UNKNOWN') {
                    ctx.addIssue({
                        code: zod_1.z.ZodIssueCode.custom,
                        message: 'Câu hỏi con phải có Độ khó cụ thể khi Xuất bản.',
                        path: ['subQuestions', index, 'difficultyLevel']
                    });
                }
            });
        }
    }
};
exports.QuestionItemSchema = exports.BaseQuestionItemSchema.superRefine(validateQuestionLogic);
exports.BulkCreateQuestionZodSchema = zod_1.z.object({
    folderId: zod_1.z.string().min(1, 'Thiếu ID Thư mục lưu trữ'),
    questions: zod_1.z.array(exports.QuestionItemSchema).min(1, 'Phải có ít nhất 1 câu hỏi/đoạn văn'),
});
exports.UpdateSingleQuestionSchema = zod_1.z.object({
    content: zod_1.z.string().optional(),
    explanation: zod_1.z.string().optional(),
    topicId: zod_1.z.string().optional(),
    isDraft: zod_1.z.boolean().optional(),
    difficultyLevel: zod_1.z.enum(['NB', 'TH', 'VD', 'VDC', 'UNKNOWN']).optional(),
    answers: zod_1.z.array(exports.AnswerOptionSchema).optional(),
    attachedMedia: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.EditSubQuestionSchema = exports.SubQuestionSchema.extend({
    _id: zod_1.z.string().optional(),
    id: zod_1.z.string().optional(),
});
exports.UpdatePassageSchema = zod_1.z.object({
    content: zod_1.z.string().optional(),
    explanation: zod_1.z.string().optional(),
    topicId: zod_1.z.string().optional(),
    isDraft: zod_1.z.boolean().optional(),
    difficultyLevel: zod_1.z.enum(['NB', 'TH', 'VD', 'VDC', 'UNKNOWN']).optional(),
    attachedMedia: zod_1.z.array(zod_1.z.string()).optional(),
    subQuestions: zod_1.z.array(exports.EditSubQuestionSchema).min(1, 'Đoạn văn phải có ít nhất 1 câu hỏi con'),
});
exports.EditQuestionFormSchema = exports.BaseQuestionItemSchema.extend({
    _id: zod_1.z.string().optional(),
    subQuestions: zod_1.z.array(exports.EditSubQuestionSchema).optional(),
}).superRefine(validateQuestionLogic);
exports.MatrixCriterionSchema = zod_1.z.object({
    folderIds: zod_1.z.array(zod_1.z.string()).min(1, 'Vui lòng chọn ít nhất 1 thư mục'),
    topicId: zod_1.z.string().min(1, 'Vui lòng chọn chuyên đề'),
    difficulty: zod_1.z.enum(['NB', 'TH', 'VD', 'VDC']),
    limit: zod_1.z.number().min(1, 'Số lượng tối thiểu là 1'),
});
exports.GenerateExamSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Tiêu đề không được để trống'),
    duration: zod_1.z.number().min(1, 'Thời gian thi tối thiểu 1 phút'),
    totalScore: zod_1.z.number().min(0, 'Tổng điểm không hợp lệ'),
    criteria: zod_1.z.array(exports.MatrixCriterionSchema).min(1, 'Phải có ít nhất 1 tiêu chí ma trận'),
});
exports.GenerateExamFormSchema = exports.GenerateExamSchema.extend({
    subjectId: zod_1.z.string().min(1, 'Vui lòng chọn môn học để lấy chuyên đề'),
});
exports.MatrixRuleSchema = zod_1.z.object({
    limit: zod_1.z.number().min(1, 'Số lượng tối thiểu là 1'),
    folderIds: zod_1.z.array(zod_1.z.string()).default([]),
    topicIds: zod_1.z.array(zod_1.z.string()).default([]),
    difficulties: zod_1.z.array(zod_1.z.enum(['NB', 'TH', 'VD', 'VDC'])).default([]),
    tags: zod_1.z.array(zod_1.z.string()).default([]),
});
exports.MatrixSectionSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Tên phần thi không được để trống'),
    orderIndex: zod_1.z.number().min(0),
    rules: zod_1.z.array(exports.MatrixRuleSchema).min(1, 'Phải có ít nhất 1 luật bốc câu hỏi'),
});
exports.FillFromMatrixFormSchema = zod_1.z.discriminatedUnion('mode', [
    zod_1.z.object({
        mode: zod_1.z.literal('TEMPLATE'),
        matrixId: zod_1.z.string().min(1, 'Vui lòng chọn khuôn mẫu'),
    }),
    zod_1.z.object({
        mode: zod_1.z.literal('ADHOC'),
        adHocSections: zod_1.z.array(exports.MatrixSectionSchema).min(1, 'Phải có ít nhất 1 phần thi'),
    }),
]);
exports.UpdatePointsSchema = zod_1.z.union([
    zod_1.z.object({
        divideEqually: zod_1.z.literal(true),
    }),
    zod_1.z.object({
        pointsData: zod_1.z.array(zod_1.z.object({
            questionId: zod_1.z.string().min(1),
            points: zod_1.z.number().min(0, 'Điểm không hợp lệ'),
        })).min(1, 'Không có dữ liệu điểm'),
    }),
]);
exports.ActiveFiltersPayloadSchema = zod_1.z.object({
    folderIds: zod_1.z.array(zod_1.z.string()).optional(),
    topicIds: zod_1.z.array(zod_1.z.string()).optional(),
    difficulties: zod_1.z.array(zod_1.z.enum(['NB', 'TH', 'VD', 'VDC', 'UNKNOWN'])).optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    isDraft: zod_1.z.boolean().optional(),
});
exports.DynamicPreviewRequestSchema = zod_1.z.object({
    matrixId: zod_1.z.string().optional(),
    adHocSections: zod_1.z.array(exports.MatrixSectionSchema).optional(),
    name: zod_1.z.string().min(1, 'Tên phần thi không được để trống').optional(),
    orderIndex: zod_1.z.number().min(0).optional(),
    rules: zod_1.z.array(exports.MatrixRuleSchema).optional(),
}).refine(data => data.matrixId ||
    (data.adHocSections && data.adHocSections.length > 0) ||
    (data.rules && data.rules.length > 0), {
    message: 'Thiếu dữ liệu cấu hình để xem trước đề thi.'
});
//# sourceMappingURL=exam.schema.js.map