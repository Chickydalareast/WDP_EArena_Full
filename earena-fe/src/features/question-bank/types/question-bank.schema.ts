import { z } from 'zod';
import { QuestionItemDTO } from '@/features/exam-builder/types/exam.schema';

export const FolderPayloadSchema = z.object({
  name: z.string().min(1, 'Tên thư mục không được để trống'),
  description: z.string().optional(),
  parentId: z.string().nullable().optional(),
});

export type FolderPayloadDTO = z.infer<typeof FolderPayloadSchema>;

export interface FolderNode {
  _id: string;
  name: string;
  description?: string;
  parentId?: string | null;
  children?: FolderNode[];
  createdAt?: string;
  updatedAt?: string;
}

export const BulkMoveQuestionsSchema = z.object({
  questionIds: z.array(z.string()).min(1, 'Phải chọn ít nhất 1 câu hỏi'),
  destFolderId: z.string().min(1, 'Vui lòng chọn thư mục đích'),
});

export type BulkMoveQuestionsDTO = z.infer<typeof BulkMoveQuestionsSchema>;

export interface FetchBankQuestionsParams {
  page?: number;
  limit?: number;
  folderIds?: string[];
  topicIds?: string[];
  difficultyLevels?: ('NB' | 'TH' | 'VD' | 'VDC' | 'UNKNOWN')[];
  tags?: string[];
  search?: string;
  isDraft?: boolean;
}

export interface BankQuestionsResponse {
  items: QuestionItemDTO[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const CloneQuestionSchema = z.object({
  destFolderId: z.string().min(1, 'Vui lòng chọn thư mục đích'),
});
export type CloneQuestionDTO = z.infer<typeof CloneQuestionSchema>;

export const BulkCloneQuestionsSchema = z.object({
  questionIds: z.array(z.string()).min(1, 'Phải chọn ít nhất 1 câu hỏi'),
  destFolderId: z.string().min(1, 'Vui lòng chọn thư mục đích'),
});
export type BulkCloneQuestionsDTO = z.infer<typeof BulkCloneQuestionsSchema>;

export const BulkDeleteQuestionsSchema = z.object({
  questionIds: z.array(z.string()).min(1, 'Phải chọn ít nhất 1 câu hỏi để xóa'),
});
export type BulkDeleteQuestionsDTO = z.infer<typeof BulkDeleteQuestionsSchema>;


const MAX_FILE_SIZE = 15 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
];

export const AiQuestionBuilderSchema = z.object({
  files: z.array(z.custom<File>((val) => val instanceof File, 'Định dạng tệp không hợp lệ'))
    .min(1, 'Vui lòng chọn ít nhất 1 tài liệu đề thi để AI phân tích')
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

  folderId: z.string().min(1, 'Hệ thống bị lỗi nhận dạng Thư mục lưu trữ'),


  additionalInstructions: z.string()
    .max(2000, 'Lời dặn dò không được vượt quá 2000 ký tự')
    .optional(),
});

export type AiQuestionBuilderDTO = z.infer<typeof AiQuestionBuilderSchema>;

export interface AiQuestionBuilderResponse {
  status: 'SUCCESS';
  questionsGenerated: number;
  message: string;
}

export const OrganizeStrategyEnum = z.enum(['TOPIC_STRICT', 'TOPIC_AND_DIFFICULTY', 'FLAT_DIFFICULTY']);

export const OrganizeQuestionsPayloadSchema = z.object({
  questionIds: z.array(z.string()).min(1, 'Phải chọn ít nhất 1 câu hỏi để tổ chức'),
  strategy: OrganizeStrategyEnum,
  baseFolderId: z.string().optional(),
});

export type OrganizeQuestionsPayload = z.infer<typeof OrganizeQuestionsPayloadSchema>;

export interface VirtualFolderNode {
  _id: string;
  name: string;
  parentId: string | null;
  ancestors: string[];
  isNew: boolean;
}

export interface QuestionMapping {
  questionId: string;
  targetFolderId: string;
}

export interface OrganizePreviewResponse {
  strategyUsed: string;
  virtualTree: VirtualFolderNode[];
  mappings: QuestionMapping[];
  stats: {
    totalQuestions: number;
    newFoldersToCreate: number;
    unclassifiedQuestions: number;
  };
}

export interface OrganizeExecuteResponse {
  message: string;
  stats: {
    totalQuestions: number;
    newFoldersToCreate: number;
    unclassifiedQuestions: number;
  };
}

export const BulkAutoTagSchema = z.object({
  questionIds: z.array(z.string()).min(1, 'Phải chọn ít nhất 1 câu hỏi').max(200, 'Chỉ được xử lý tối đa 200 câu hỏi mỗi lần'),
});

export type BulkAutoTagDTO = z.infer<typeof BulkAutoTagSchema>;

export interface BulkAutoTagResponse {
  message: string;
  jobDispatched: boolean;
}

export interface IAiProcessedQuestion {
  id: string;
  difficultyLevel: 'NB' | 'TH' | 'VD' | 'VDC' | 'UNKNOWN';
  topicId: string | null;
  tags: string[];
}

export interface IAiBatchProgress {
  current: number;
  total: number;
}

export interface IAiBatchCompletedEvent {
  event: 'AUTO_TAG_BATCH_COMPLETED';
  batchNum: number;
  totalBatches: number;
  processedQuestions: IAiProcessedQuestion[];
}

export const BulkPublishQuestionsSchema = z.object({
  questionIds: z.array(z.string()).min(1, 'Phải chọn ít nhất 1 câu hỏi để xuất bản'),
});

export type BulkPublishQuestionsDTO = z.infer<typeof BulkPublishQuestionsSchema>;

export interface BulkPublishResponse {
  publishedCount: number;
}