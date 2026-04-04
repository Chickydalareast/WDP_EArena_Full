"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuizHealthDataSchema = exports.QuizHealthRuleStatusSchema = exports.QuizBuilderPreviewPayloadSchema = exports.QuizRulePreviewPayloadSchema = exports.updateCourseSchema = exports.baseUpdateCourseSchema = exports.createCourseSchema = exports.reorderCurriculumSchema = exports.ProgressionModeEnum = exports.CourseStatus = void 0;
const zod_1 = require("zod");
const exam_schema_1 = require("@/features/exam-builder/types/exam.schema");
var CourseStatus;
(function (CourseStatus) {
    CourseStatus["DRAFT"] = "DRAFT";
    CourseStatus["PENDING_REVIEW"] = "PENDING_REVIEW";
    CourseStatus["PUBLISHED"] = "PUBLISHED";
    CourseStatus["REJECTED"] = "REJECTED";
    CourseStatus["ARCHIVED"] = "ARCHIVED";
})(CourseStatus || (exports.CourseStatus = CourseStatus = {}));
exports.ProgressionModeEnum = zod_1.z.enum(['FREE', 'STRICT_LINEAR']);
exports.reorderCurriculumSchema = zod_1.z.object({
    sections: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string().min(1, 'Thiếu ID Chương'),
        order: zod_1.z.number().min(1),
    })).default([]),
    lessons: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string().min(1, 'Thiếu ID Bài học'),
        order: zod_1.z.number().min(1),
        sectionId: zod_1.z.string().min(1, 'Bắt buộc phải có sectionId để phòng kéo thả chéo chương'),
    })).default([]),
});
exports.createCourseSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Tên khóa học không được để trống'),
    price: zod_1.z.coerce.number().min(0, 'Giá khóa học không được âm'),
    description: zod_1.z.string().optional(),
    progressionMode: exports.ProgressionModeEnum.default('FREE'),
    isStrictExam: zod_1.z.boolean().default(false),
});
exports.baseUpdateCourseSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Tên không được để trống').optional(),
    price: zod_1.z.coerce.number().min(0).optional(),
    discountPrice: zod_1.z.coerce.number().min(0).optional(),
    description: zod_1.z.string().optional(),
    benefits: zod_1.z.array(zod_1.z.string()).optional(),
    requirements: zod_1.z.array(zod_1.z.string()).optional(),
    coverImageId: zod_1.z.string().nullable().optional(),
    promotionalVideoId: zod_1.z.string().nullable().optional(),
    progressionMode: exports.ProgressionModeEnum.optional(),
    isStrictExam: zod_1.z.boolean().optional(),
});
exports.updateCourseSchema = exports.baseUpdateCourseSchema.superRefine((data, ctx) => {
    if (typeof data.price === 'number' && typeof data.discountPrice === 'number') {
        if (data.discountPrice > data.price) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: "Giá khuyến mãi không được lớn hơn giá gốc",
                path: ["discountPrice"],
            });
        }
    }
});
exports.QuizRulePreviewPayloadSchema = zod_1.z.object({
    folderIds: zod_1.z.array(zod_1.z.string()).min(1, 'Phải chọn ít nhất 1 thư mục'),
    topicIds: zod_1.z.array(zod_1.z.string()).optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    difficulties: zod_1.z.array(zod_1.z.enum(['NB', 'TH', 'VD', 'VDC'])).default([]),
    limit: zod_1.z.number().min(1, 'Số câu tối thiểu là 1'),
});
exports.QuizBuilderPreviewPayloadSchema = zod_1.z.object({
    adHocSections: zod_1.z.array(exam_schema_1.MatrixSectionSchema).optional(),
    matrixId: zod_1.z.string().optional(),
}).refine((data) => data.matrixId || (data.adHocSections && data.adHocSections.length > 0), { message: 'Phải cung cấp matrixId hoặc adHocSections', path: ['adHocSections'] });
exports.QuizHealthRuleStatusSchema = zod_1.z.object({
    sectionName: zod_1.z.string(),
    requiredCount: zod_1.z.number(),
    availableCount: zod_1.z.number(),
    isSufficient: zod_1.z.boolean(),
    safetyRatio: zod_1.z.number(),
    isWarning: zod_1.z.boolean(),
});
exports.QuizHealthDataSchema = zod_1.z.object({
    lessonId: zod_1.z.string(),
    examId: zod_1.z.string(),
    isHealthy: zod_1.z.boolean(),
    hasWarning: zod_1.z.boolean(),
    isLocked: zod_1.z.boolean(),
    matrixExists: zod_1.z.boolean().nullable(),
    configMode: zod_1.z.enum(['matrix', 'adHoc', 'unconfigured']),
    rules: zod_1.z.array(exports.QuizHealthRuleStatusSchema),
});
//# sourceMappingURL=course.schema.js.map