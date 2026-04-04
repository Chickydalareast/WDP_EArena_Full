import { z } from 'zod';
import { MatrixSectionSchema } from '@/features/exam-builder/types/exam.schema';

export const ExamRuleSchema = z.object({
  timeLimit: z.number().min(0, 'Thời gian làm bài không được âm').default(45),
  maxAttempts: z.number().min(0, 'Số lần làm bài tối thiểu là 0 (0 = Không giới hạn)').default(1),
  passPercentage: z.number().min(0).max(100, 'Điểm chuẩn không vượt quá 100%').default(50),
  showResultMode: z.enum(['IMMEDIATELY', 'AFTER_END_TIME', 'NEVER']).default('IMMEDIATELY'),
});
export type ExamRuleDTO = z.infer<typeof ExamRuleSchema>;

export const createSectionSchema = z.object({
  title: z.string().min(1, 'Tên chương/phần không được để trống'),
  description: z.string().optional(),
});
export type CreateSectionDTO = z.infer<typeof createSectionSchema>;

export const createLessonSchema = z.object({
  title: z.string().min(1, 'Tên bài học không được để trống'),
  isFreePreview: z.boolean().default(false),

  content: z.string().optional(),
  primaryVideoId: z.string().optional(),
  examId: z.string().optional(),
  examRules: ExamRuleSchema.optional(),
  attachments: z.array(z.string()).default([]),
}).superRefine((data, ctx) => {
  const hasContent = data.content && data.content.trim() !== '' && data.content !== '<p></p>';
  const hasVideo = !!data.primaryVideoId;
  const hasExam = !!data.examId;
  const hasAttachments = data.attachments && data.attachments.length > 0;

  if (!hasContent && !hasVideo && !hasExam && !hasAttachments) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['title'],
      message: 'Bài học không được để trống. Vui lòng nhập nội dung, đính kèm video, bài thi hoặc tài liệu.',
    });
  }

  if (hasExam && !data.examRules) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['examRules'],
      message: 'Vui lòng cấu hình luật thi (Exam Rules) cho bài trắc nghiệm.',
    });
  }
});
export type CreateLessonDTO = z.infer<typeof createLessonSchema>;

export const updateSectionSchema = z.object({
  title: z.string().min(1, 'Tên chương không được để trống').optional(),
  description: z.string().optional(),
});
export type UpdateSectionDTO = z.infer<typeof updateSectionSchema>;

export const updateLessonSchema = z.object({
  title: z.string().min(1, 'Tên bài học không được để trống').optional(),
  isFreePreview: z.boolean().optional(),
  content: z.string().optional(),
  primaryVideoId: z.string().optional(),
  examId: z.string().optional(),
  examRules: ExamRuleSchema.optional(),
  attachments: z.array(z.string()).optional(),
});
export type UpdateLessonDTO = z.infer<typeof updateLessonSchema>;

const MAX_FILE_SIZE = 15 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
];

export const aiBuilderFormSchema = z.object({
  files: z.array(z.custom<File>((val) => val instanceof File, 'Định dạng tệp không hợp lệ'))
    .min(1, 'Vui lòng chọn ít nhất 1 tài liệu để AI phân tích')
    .max(5, 'Chỉ được phép chọn tối đa 5 tài liệu cùng lúc')
    .refine(
      (files) => files.every((file) => file.size <= MAX_FILE_SIZE),
      'Dung lượng mỗi tài liệu không được vượt quá 15MB'
    )
    .refine(
      (files) => files.every((file) => {
        const extension = file.name.split('.').pop()?.toLowerCase();
        return ACCEPTED_FILE_TYPES.includes(file.type) || ['pdf', 'docx', 'txt'].includes(extension || '');
      }),
      'Hệ thống chỉ hỗ trợ định dạng .pdf, .docx, và .txt'
    ),

  targetSectionCount: z.preprocess(
    (val) => (val === '' || val === null ? undefined : Number(val)),
    z.number()
      .min(1, 'Số lượng chương tối thiểu là 1')
      .max(50, 'Số lượng chương tối đa là 50')
      .optional()
  ),

  additionalInstructions: z.string()
    .max(2000, 'Lời dặn dò không được vượt quá 2000 ký tự')
    .optional(),
});

export type AiBuilderFormDTO = z.infer<typeof aiBuilderFormSchema>;

export interface AiBuilderResponse {
  status: 'SUCCESS';
  sectionsGenerated: number;
  message: string;
}

export const DynamicConfigSchema = z.object({
  matrixId: z.string().optional(),
  adHocSections: z.array(MatrixSectionSchema).optional(),
}).refine(data => data.matrixId || (data.adHocSections && data.adHocSections.length > 0), {
  message: 'Bắt buộc phải chọn Ma trận mẫu hoặc tự tạo Luật bốc đề.',
  path: ['adHocSections']
});
export type DynamicConfigDTO = z.infer<typeof DynamicConfigSchema>;

export const CreateQuizLessonSchema = z.object({
  courseId: z.string().min(1, 'Thiếu ID Khóa học'),
  sectionId: z.string().min(1, 'Thiếu ID Chương học'),
  title: z.string().min(1, 'Tên bài kiểm tra không được để trống'),
  content: z.string().optional(),
  isFreePreview: z.boolean().default(false),
  totalScore: z.number().min(1).default(10),
  dynamicConfig: DynamicConfigSchema,
  examRules: ExamRuleSchema,
});
export type CreateQuizLessonDTO = z.infer<typeof CreateQuizLessonSchema>;

export const UpdateQuizLessonSchema = CreateQuizLessonSchema.partial().extend({
  lessonId: z.string().min(1, 'Thiếu ID Bài học cần cập nhật'),
});
export type UpdateQuizLessonDTO = z.infer<typeof UpdateQuizLessonSchema>;