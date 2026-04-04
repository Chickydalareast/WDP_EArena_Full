import { z } from 'zod';
export declare const InitExamSchema: any;
export type InitExamDTO = z.infer<typeof InitExamSchema>;
export interface InitExamResponse {
    examId: string;
    paperId: string;
}
export declare const UpdatePaperSchema: any;
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
export declare const AnswerOptionSchema: any;
export type AnswerOptionDTO = z.infer<typeof AnswerOptionSchema>;
export declare const SubQuestionSchema: any;
export type SubQuestionDTO = z.infer<typeof SubQuestionSchema>;
export declare const BaseQuestionItemSchema: any;
export type BaseQuestionInput = z.infer<typeof BaseQuestionItemSchema>;
export declare const QuestionItemSchema: any;
export type QuestionItemDTO = z.infer<typeof QuestionItemSchema>;
export declare const BulkCreateQuestionZodSchema: any;
export type BulkCreateQuestionDTO = z.infer<typeof BulkCreateQuestionZodSchema>;
export declare const UpdateSingleQuestionSchema: any;
export type UpdateSingleQuestionDTO = z.infer<typeof UpdateSingleQuestionSchema>;
export declare const EditSubQuestionSchema: any;
export type EditSubQuestionDTO = z.infer<typeof EditSubQuestionSchema>;
export declare const UpdatePassageSchema: any;
export type UpdatePassageDTO = z.infer<typeof UpdatePassageSchema>;
export declare const EditQuestionFormSchema: any;
export type EditQuestionFormDTO = z.infer<typeof EditQuestionFormSchema>;
export declare const MatrixCriterionSchema: any;
export declare const GenerateExamSchema: any;
export type GenerateExamDTO = z.infer<typeof GenerateExamSchema>;
export declare const GenerateExamFormSchema: any;
export type GenerateExamFormValues = z.infer<typeof GenerateExamFormSchema>;
export interface GenerateExamResponse {
    examId: string;
    examPaperId: string;
    totalItems: number;
    totalActualQuestions: number;
}
export declare const MatrixRuleSchema: any;
export type MatrixRuleDTO = z.infer<typeof MatrixRuleSchema>;
export declare const MatrixSectionSchema: any;
export type MatrixSectionDTO = z.infer<typeof MatrixSectionSchema>;
export declare const FillFromMatrixFormSchema: any;
export type FillFromMatrixFormValues = z.infer<typeof FillFromMatrixFormSchema>;
export type FillFromMatrixDTO = {
    matrixId: string;
} | {
    adHocSections: MatrixSectionDTO[];
};
export interface FillFromMatrixResponse {
    message: string;
    addedItems: number;
    addedActualQuestions: number;
}
export declare const UpdatePointsSchema: any;
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
export declare const ActiveFiltersPayloadSchema: any;
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
    folders?: unknown[];
}
export interface PreviewMatrixRuleResponse {
    availableQuestionsCount: number;
}
export declare const DynamicPreviewRequestSchema: any;
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
