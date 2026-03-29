import { z } from 'zod';

export const InitExamSchema = z.object({
  title: z.string().min(1, 'Tiêu đề không được để trống'),
  description: z.string().optional(),
  totalScore: z.number().min(0, 'Tổng điểm không hợp lệ'),
});
export type InitExamDTO = z.infer<typeof InitExamSchema>;

export interface InitExamResponse {
  examId: string;
  paperId: string;
}

export const UpdatePaperSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.enum(['ADD', 'REMOVE']),
    questionId: z.string().min(1, 'Thiếu ID câu hỏi'),
  }),
  z.object({
    action: z.literal('REORDER'),
    questionIds: z.array(z.string()).min(1, 'Danh sách thứ tự không được rỗng'),
  })
]);

export type UpdatePaperDTO = z.infer<typeof UpdatePaperSchema>;

export interface PublishExamResponse {
  message: string;
}

// export const GenerateExamSchema = z.object({
//   title: z.string().min(1),
//   duration: z.number().min(1),
//   totalScore: z.number().min(0),
//   criteria: z.array(z.any()),
// });
// export type GenerateExamDTO = z.infer<typeof GenerateExamSchema>;


export interface StudentAssignmentItem {
  assignment: {
    id: string;
    title: string;
    timeLimit: number;
    startTime: string;
    endTime: string;
    mode: 'STANDARD' | 'STRICT';
    showResultMode: 'IMMEDIATELY' | 'AFTER_END_TIME' | 'NEVER';
  };
  progress: {
    attemptsUsed: number;
    maxAttempts: number;
    bestScore: number | null;
    hasActiveSubmission: boolean;
    studentStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED';
    latestSubmissionId: string | null;
  };
}

export const AnswerOptionSchema = z.object({
  id: z.string().min(1, 'ID đáp án không hợp lệ'),
  content: z.string().min(1, 'Nội dung đáp án không được trống'),
  isCorrect: z.boolean(),
});
export type AnswerOptionDTO = z.infer<typeof AnswerOptionSchema>;

export const SubQuestionSchema = z.object({
  content: z.string().min(5, 'Nội dung câu hỏi con quá ngắn'),
  explanation: z.string().optional(),
  difficultyLevel: z.enum(['NB', 'TH', 'VD', 'VDC', 'UNKNOWN']).default('UNKNOWN'),
  answers: z.array(AnswerOptionSchema).min(2, 'Phải có ít nhất 2 đáp án'),
  attachedMedia: z.array(z.string()).default([]),
});
export type SubQuestionDTO = z.infer<typeof SubQuestionSchema>;

// ==============================================================
// 1. BASE SHAPES (Trích xuất các field chung để tái sử dụng, tránh lỗi ZodEffects)
// ==============================================================

// Tách riêng ruột object để không bị dính ZodEffects từ superRefine
const BaseQuestionShape = {
  type: z.enum(['MULTIPLE_CHOICE', 'PASSAGE']),
  content: z.string().min(5, 'Nội dung quá ngắn'),
  explanation: z.string().optional(),
  
  // [BỔ SUNG] 2 trường phục vụ luồng Draft vs Publish
  topicId: z.string().optional(), 
  isDraft: z.boolean().default(true), 
  
  difficultyLevel: z.enum(['NB', 'TH', 'VD', 'VDC', 'UNKNOWN']).default('UNKNOWN'),
  tags: z.array(z.string()).optional(),
  answers: z.array(AnswerOptionSchema).optional(),
  subQuestions: z.array(SubQuestionSchema).optional(),
  attachedMedia: z.array(z.string()).default([]),
};

// Khai báo Base Schema thuần túy
export const BaseQuestionItemSchema = z.object(BaseQuestionShape);
export type BaseQuestionInput = z.infer<typeof BaseQuestionItemSchema>;

// Hàm dùng chung cho superRefine để DRY (Don't Repeat Yourself)
const validateQuestionLogic = (data: BaseQuestionInput, ctx: z.RefinementCtx) => {
  // --- A. Logic kiểm tra cấu trúc (Structure Logic) ---
  if (data.type === 'PASSAGE') {
    if (!data.subQuestions || data.subQuestions.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Đoạn văn (PASSAGE) phải có ít nhất 1 câu hỏi con.',
        path: ['subQuestions'],
      });
    }
    if (data.answers && data.answers.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Đoạn văn mẹ không được chứa đáp án trực tiếp.',
        path: ['answers'],
      });
    }
  } else if (data.type === 'MULTIPLE_CHOICE') {
    if (!data.answers || data.answers.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Câu hỏi trắc nghiệm phải có ít nhất 2 đáp án.',
        path: ['answers'],
      });
    }
  }

  // --- B. Logic chuẩn hóa (Business Logic cho Publish Flow) ---
  if (data.isDraft === false) {
    if (!data.topicId || data.topicId.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Bắt buộc chọn Chuyên đề khi Xuất bản câu hỏi.',
        path: ['topicId']
      });
    }

    if (data.difficultyLevel === 'UNKNOWN') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Bắt buộc chọn Độ khó cụ thể (không được để "Chưa xác định").',
        path: ['difficultyLevel']
      });
    }

    // [DEEP CHECK] Quét toàn bộ câu hỏi con của PASSAGE, cấm UNKNOWN
    if (data.type === 'PASSAGE' && data.subQuestions) {
      data.subQuestions.forEach((subQ, index) => {
        if (subQ.difficultyLevel === 'UNKNOWN') {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Câu hỏi con phải có Độ khó cụ thể khi Xuất bản.',
            path: ['subQuestions', index, 'difficultyLevel']
          });
        }
      });
    }
  }
};

// ==============================================================
// 2. SCHEMAS CHO LUỒNG CREATE & BULK
// ==============================================================

export const QuestionItemSchema = BaseQuestionItemSchema.superRefine(validateQuestionLogic);
export type QuestionItemDTO = z.infer<typeof QuestionItemSchema>;

export const BulkCreateQuestionZodSchema = z.object({
  folderId: z.string().min(1, 'Thiếu ID Thư mục lưu trữ'),
  questions: z.array(QuestionItemSchema).min(1, 'Phải có ít nhất 1 câu hỏi/đoạn văn'),
});
export type BulkCreateQuestionDTO = z.infer<typeof BulkCreateQuestionZodSchema>;
// ==============================================================
// 3. SCHEMAS CHO LUỒNG UPDATE API
// ==============================================================

export const UpdateSingleQuestionSchema = z.object({
  content: z.string().optional(),
  explanation: z.string().optional(),
  topicId: z.string().optional(), 
  isDraft: z.boolean().optional(), 
  difficultyLevel: z.enum(['NB', 'TH', 'VD', 'VDC', 'UNKNOWN']).optional(),
  answers: z.array(AnswerOptionSchema).optional(),
  attachedMedia: z.array(z.string()).optional(),
});
export type UpdateSingleQuestionDTO = z.infer<typeof UpdateSingleQuestionSchema>;

export const EditSubQuestionSchema = SubQuestionSchema.extend({
  _id: z.string().optional(),
  id: z.string().optional(),
});
export type EditSubQuestionDTO = z.infer<typeof EditSubQuestionSchema>;
export const UpdatePassageSchema = z.object({
  content: z.string().optional(),
  explanation: z.string().optional(),
  topicId: z.string().optional(),
  isDraft: z.boolean().optional(),
  difficultyLevel: z.enum(['NB', 'TH', 'VD', 'VDC', 'UNKNOWN']).optional(),
  attachedMedia: z.array(z.string()).optional(),
  subQuestions: z.array(EditSubQuestionSchema).min(1, 'Đoạn văn phải có ít nhất 1 câu hỏi con'),
});
export type UpdatePassageDTO = z.infer<typeof UpdatePassageSchema>;

export const EditQuestionFormSchema = BaseQuestionItemSchema.extend({
  _id: z.string().optional(),
  subQuestions: z.array(EditSubQuestionSchema).optional(),
}).superRefine(validateQuestionLogic);
export type EditQuestionFormDTO = z.infer<typeof EditQuestionFormSchema>;

export const MatrixCriterionSchema = z.object({
  folderIds: z.array(z.string()).min(1, 'Vui lòng chọn ít nhất 1 thư mục'),
  topicId: z.string().min(1, 'Vui lòng chọn chuyên đề'),
  difficulty: z.enum(['NB', 'TH', 'VD', 'VDC'], { required_error: 'Chọn độ khó' }),
  limit: z.number().min(1, 'Số lượng tối thiểu là 1'),
});

// 2. Schema DTO gửi xuống BE (Tuân thủ 100% Contract)
export const GenerateExamSchema = z.object({
  title: z.string().min(1, 'Tiêu đề không được để trống'),
  duration: z.number().min(1, 'Thời gian thi tối thiểu 1 phút'),
  totalScore: z.number().min(0, 'Tổng điểm không hợp lệ'),
  criteria: z.array(MatrixCriterionSchema).min(1, 'Phải có ít nhất 1 tiêu chí ma trận'),
});
export type GenerateExamDTO = z.infer<typeof GenerateExamSchema>;

// 3. Schema mở rộng dành riêng cho UI Form (chứa field chọn Môn học tạm thời)
export const GenerateExamFormSchema = GenerateExamSchema.extend({
  subjectId: z.string().min(1, 'Vui lòng chọn môn học để lấy chuyên đề'),
});
export type GenerateExamFormValues = z.infer<typeof GenerateExamFormSchema>;

// 4. Response Type từ BE
export interface GenerateExamResponse {
  examId: string;
  examPaperId: string;
  totalItems: number;
  totalActualQuestions: number;
}