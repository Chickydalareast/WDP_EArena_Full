import { QuestionItemDTO } from '@/features/exam-builder/types/exam.schema';
import type { FolderNode, FolderPayloadDTO, FetchBankQuestionsParams, BankQuestionsResponse, BulkMoveQuestionsDTO, CloneQuestionDTO, BulkCloneQuestionsDTO, BulkDeleteQuestionsDTO, AiQuestionBuilderResponse, AiQuestionBuilderDTO, OrganizeQuestionsPayload, OrganizePreviewResponse, OrganizeExecuteResponse, BulkAutoTagDTO, BulkAutoTagResponse, BulkPublishResponse, BulkPublishQuestionsDTO } from '../types/question-bank.schema';
export declare const questionBankService: {
    getFolderTree: () => Promise<FolderNode[]>;
    createFolder: (data: FolderPayloadDTO) => Promise<FolderNode>;
    updateFolder: (id: string, data: Partial<FolderPayloadDTO>) => Promise<FolderNode>;
    deleteFolder: (id: string) => Promise<void>;
    getQuestionsByFolder: (params: FetchBankQuestionsParams) => Promise<BankQuestionsResponse>;
    bulkCreateQuestions: (data: {
        folderId: string;
        questions: QuestionItemDTO[];
    }) => Promise<void>;
    bulkMoveQuestions: (data: BulkMoveQuestionsDTO) => Promise<void>;
    cloneQuestion: (id: string, data: CloneQuestionDTO) => Promise<void>;
    bulkCloneQuestions: (data: BulkCloneQuestionsDTO) => Promise<void>;
    bulkDeleteQuestions: (data: BulkDeleteQuestionsDTO) => Promise<void>;
    generateAiQuestions: (data: AiQuestionBuilderDTO) => Promise<AiQuestionBuilderResponse>;
    previewAutoOrganize: (data: OrganizeQuestionsPayload) => Promise<OrganizePreviewResponse>;
    executeAutoOrganize: (data: OrganizeQuestionsPayload) => Promise<OrganizeExecuteResponse>;
    bulkAutoTag: (data: BulkAutoTagDTO) => Promise<BulkAutoTagResponse>;
    bulkPublishQuestions: (data: BulkPublishQuestionsDTO) => Promise<BulkPublishResponse>;
};
