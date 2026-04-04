import { z } from 'zod';

export const InitExamSchema = z.object({
  title: z.string().min(1, 'Tiêu đề không được để trống'),
  description: z.string().optional(),
  totalScore: z.number().min(0, 'Tổng điểm không hợp lệ'),
  subjectId: z.string().min(1, 'Vui lòng chọn môn học cho đề thi này'),
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

const BaseQuestionShape = {
  type: z.enum(['MULTIPLE_CHOICE', 'PASSAGE']),
  content: z.string().min(5, 'Nội dung quá ngắn'),
  explanation: z.string().optional(),

  topicId: z.string().optional(),
  isDraft: z.boolean().default(true),

  difficultyLevel: z.enum(['NB', 'TH', 'VD', 'VDC', 'UNKNOWN']).default('UNKNOWN'),
  tags: z.array(z.string()).optional(),
  answers: z.array(AnswerOptionSchema).optional(),
  subQuestions: z.array(SubQuestionSchema).optional(),
  attachedMedia: z.array(z.string()).default([]),
};

export const BaseQuestionItemSchema = z.object(BaseQuestionShape);
export type BaseQuestionInput = z.infer<typeof BaseQuestionItemSchema>;

const validateQuestionLogic = (data: BaseQuestionInput, ctx: z.RefinementCtx) => {
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


export const QuestionItemSchema = BaseQuestionItemSchema.superRefine(validateQuestionLogic);
export type QuestionItemDTO = z.infer<typeof QuestionItemSchema>;

export const BulkCreateQuestionZodSchema = z.object({
  folderId: z.string().min(1, 'Thiếu ID Thư mục lưu trữ'),
  questions: z.array(QuestionItemSchema).min(1, 'Phải có ít nhất 1 câu hỏi/đoạn văn'),
});
export type BulkCreateQuestionDTO = z.infer<typeof BulkCreateQuestionZodSchema>;

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
  difficulty: z.enum(['NB', 'TH', 'VD', 'VDC']),
  limit: z.number().min(1, 'Số lượng tối thiểu là 1'),
});

export const GenerateExamSchema = z.object({
  title: z.string().min(1, 'Tiêu đề không được để trống'),
  duration: z.number().min(1, 'Thời gian thi tối thiểu 1 phút'),
  totalScore: z.number().min(0, 'Tổng điểm không hợp lệ'),
  criteria: z.array(MatrixCriterionSchema).min(1, 'Phải có ít nhất 1 tiêu chí ma trận'),
});
export type GenerateExamDTO = z.infer<typeof GenerateExamSchema>;

export const GenerateExamFormSchema = GenerateExamSchema.extend({
  subjectId: z.string().min(1, 'Vui lòng chọn môn học để lấy chuyên đề'),
});
export type GenerateExamFormValues = z.infer<typeof GenerateExamFormSchema>;

export interface GenerateExamResponse {
  examId: string;
  examPaperId: string;
  totalItems: number;
  totalActualQuestions: number;
}


export const MatrixRuleSchema = z.object({
  limit: z.number().min(1, 'Số lượng tối thiểu là 1'),
  folderIds: z.array(z.string()).default([]),
  topicIds: z.array(z.string()).default([]),
  difficulties: z.array(z.enum(['NB', 'TH', 'VD', 'VDC'])).default([]),
  tags: z.array(z.string()).default([]),
});
export type MatrixRuleDTO = z.infer<typeof MatrixRuleSchema>;

export const MatrixSectionSchema = z.object({
  name: z.string().min(1, 'Tên phần thi không được để trống'),
  orderIndex: z.number().min(0),
  rules: z.array(MatrixRuleSchema).min(1, 'Phải có ít nhất 1 luật bốc câu hỏi'),
});
export type MatrixSectionDTO = z.infer<typeof MatrixSectionSchema>;

export const FillFromMatrixFormSchema = z.discriminatedUnion('mode', [
  z.object({
    mode: z.literal('TEMPLATE'),
    matrixId: z.string().min(1, 'Vui lòng chọn khuôn mẫu'),
  }),
  z.object({
    mode: z.literal('ADHOC'),
    adHocSections: z.array(MatrixSectionSchema).min(1, 'Phải có ít nhất 1 phần thi'),
  }),
]);
export type FillFromMatrixFormValues = z.infer<typeof FillFromMatrixFormSchema>;

export type FillFromMatrixDTO =
  | { matrixId: string }
  | { adHocSections: MatrixSectionDTO[] };

export interface FillFromMatrixResponse {
  message: string;
  addedItems: number;
  addedActualQuestions: number;
}


export const UpdatePointsSchema = z.union([
  z.object({
    divideEqually: z.literal(true),
  }),
  z.object({
    pointsData: z.array(
      z.object({
        questionId: z.string().min(1),
        points: z.number().min(0, 'Điểm không hợp lệ'),
      })
    ).min(1, 'Không có dữ liệu điểm'),
  }),
]);
export type UpdatePointsDTO = z.infer<typeof UpdatePointsSchema>;


export interface MatrixTemplate {
  _id: string;
  title: string;
  description?: string;
  teacherId: string;
  subjectId: string;
  createdAt: string;
  sections?: MatrixSectionDTO[];
}

export interface PaginatedMatrixResponse {
  items: MatrixTemplate[];
}

export const ActiveFiltersPayloadSchema = z.object({
  folderIds: z.array(z.string()).optional(),
  topicIds: z.array(z.string()).optional(),
  difficulties: z.array(z.enum(['NB', 'TH', 'VD', 'VDC', 'UNKNOWN'])).optional(),
  tags: z.array(z.string()).optional(),
  isDraft: z.boolean().optional(),
});
export type ActiveFiltersPayloadDTO = z.infer<typeof ActiveFiltersPayloadSchema>;

export interface ActiveFilterTopic {
  id: string;
  name: string;
}

export interface ActiveFiltersResponse {
  folderIds: string[];
  topics: ActiveFilterTopic[];
  difficulties: string[];
  tags: string[];
  /** Cây thư mục (nếu API trả về) */
  folders?: unknown[];
}

export interface PreviewMatrixRuleResponse {
  availableQuestionsCount: number;
}


export const DynamicPreviewRequestSchema = z.object({
  matrixId: z.string().optional(),
  adHocSections: z.array(MatrixSectionSchema).optional(),
  
  name: z.string().min(1, 'Tên phần thi không được để trống').optional(),
  orderIndex: z.number().min(0).optional(),
  rules: z.array(MatrixRuleSchema).optional(),
}).refine(data => 
  data.matrixId || 
  (data.adHocSections && data.adHocSections.length > 0) || 
  (data.rules && data.rules.length > 0), 
{
  message: 'Thiếu dữ liệu cấu hình để xem trước đề thi.'
});
export type DynamicPreviewRequestDTO = z.infer<typeof DynamicPreviewRequestSchema>;

export interface DynamicPreviewResponse {
  totalItems: number;
  totalActualQuestions: number;
  previewData: {
    questions: QuestionItemDTO[]; 
  };
}

export interface CreateQuizLessonResponse {
  id: string;
  title: string;
  order: number;
}