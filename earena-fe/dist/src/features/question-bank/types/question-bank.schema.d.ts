import { z } from 'zod';
import { QuestionItemDTO } from '@/features/exam-builder/types/exam.schema';
export declare const FolderPayloadSchema: any;
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
export declare const BulkMoveQuestionsSchema: any;
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
export declare const CloneQuestionSchema: any;
export type CloneQuestionDTO = z.infer<typeof CloneQuestionSchema>;
export declare const BulkCloneQuestionsSchema: any;
export type BulkCloneQuestionsDTO = z.infer<typeof BulkCloneQuestionsSchema>;
export declare const BulkDeleteQuestionsSchema: any;
export type BulkDeleteQuestionsDTO = z.infer<typeof BulkDeleteQuestionsSchema>;
export declare const AiQuestionBuilderSchema: any;
export type AiQuestionBuilderDTO = z.infer<typeof AiQuestionBuilderSchema>;
export interface AiQuestionBuilderResponse {
    status: 'SUCCESS';
    questionsGenerated: number;
    message: string;
}
export declare const OrganizeStrategyEnum: any;
export declare const OrganizeQuestionsPayloadSchema: any;
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
export declare const BulkAutoTagSchema: any;
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
export declare const BulkPublishQuestionsSchema: any;
export type BulkPublishQuestionsDTO = z.infer<typeof BulkPublishQuestionsSchema>;
export interface BulkPublishResponse {
    publishedCount: number;
}
