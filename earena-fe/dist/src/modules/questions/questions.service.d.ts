import { Types } from 'mongoose';
import { Queue } from 'bullmq';
import { QuestionsRepository } from './questions.repository';
import { QuestionType } from './schemas/question.schema';
import { KnowledgeTopicsRepository } from '../taxonomy/knowledge-topics.repository';
import { UsersService } from '../users/users.service';
import { QuestionFoldersRepository } from './question-folders.repository';
import { MediaRepository } from '../media/media.repository';
import { BulkCreateQuestionPayload, CreateQuestionPayload, UpdatePassagePayload, QuestionSyncJobData, CloneQuestionPayload, BulkCloneQuestionPayload, BulkDeleteQuestionPayload, QuestionFilterPayload, BulkStandardizeQuestionPayload, SuggestFolderPayload, GetActiveFiltersPayload, ActiveFiltersResponse, BulkPublishQuestionPayload } from './interfaces/question.interface';
import { QuestionOrganizerEngine } from './engines/question-organizer.engine';
import { PreviewOrganizePayload } from './interfaces/question-organizer.interface';
export type UpdateQuestionPayload = Partial<CreateQuestionPayload>;
export type MoveQuestionsPayload = {
    questionIds: string[];
    destFolderId: string;
};
export declare class QuestionsService {
    private readonly questionsRepository;
    private readonly topicsRepo;
    private readonly usersService;
    private readonly foldersRepo;
    private readonly mediaRepo;
    private readonly syncQueue;
    private readonly questionTasksQueue;
    private readonly organizerEngine;
    private readonly logger;
    constructor(questionsRepository: QuestionsRepository, topicsRepo: KnowledgeTopicsRepository, usersService: UsersService, foldersRepo: QuestionFoldersRepository, mediaRepo: MediaRepository, syncQueue: Queue<QuestionSyncJobData>, questionTasksQueue: Queue, organizerEngine: QuestionOrganizerEngine);
    private dispatchSyncEvent;
    private validateMediaOwnership;
    bulkCreateQuestions(payload: BulkCreateQuestionPayload): Promise<{
        message: string;
        count: any;
        insertedIds: any;
    }>;
    bulkStandardizeQuestions(ownerId: string, payload: BulkStandardizeQuestionPayload): Promise<{
        message: string;
    }>;
    createQuestion(payload: CreateQuestionPayload): Promise<{
        message: string;
        question: {
            id: Types.ObjectId;
            content: string;
            type: QuestionType;
            attachedMedia: Types.ObjectId[];
        };
    }>;
    updateQuestion(id: string, ownerId: string, payload: UpdateQuestionPayload): Promise<any>;
    cloneQuestion(id: string, currentOwnerId: string, payload: CloneQuestionPayload): Promise<{
        message: string;
        data: any;
    }>;
    private expandHierarchyIds;
    getQuestionsPaginated(userId: string, payload: QuestionFilterPayload): Promise<{
        items: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    moveQuestions(ownerId: string, payload: MoveQuestionsPayload): Promise<{
        message: string;
    }>;
    deleteQuestion(id: string, ownerId: string): Promise<{
        message: string;
    }>;
    updatePassageWithDiffing(passageId: string, ownerId: string, payload: UpdatePassagePayload): Promise<{
        message: string;
        diffStats: {
            deleted: number;
            created: number;
            updated: number;
        };
    }>;
    bulkCloneQuestions(currentOwnerId: string, payload: BulkCloneQuestionPayload): Promise<{
        message: string;
        clonedRootCount: any;
        clonedSubCount: number;
    }>;
    bulkDeleteQuestions(currentOwnerId: string, payload: BulkDeleteQuestionPayload): Promise<{
        message: string;
        deletedCount: any;
    }>;
    suggestFoldersForMove(ownerId: string, payload: SuggestFolderPayload): Promise<any[]>;
    previewOrganize(ownerId: string, payload: PreviewOrganizePayload): Promise<import("./interfaces/question-organizer.interface").OrganizePreviewResult>;
    executeOrganize(ownerId: string, payload: PreviewOrganizePayload): Promise<{
        message: string;
        stats: {
            totalQuestions: number;
            newFoldersToCreate: number;
            unclassifiedQuestions: number;
        };
    }>;
    dispatchAutoTagJob(teacherId: string, payload: {
        questionIds: string[];
    }): Promise<{
        message: string;
        jobDispatched: boolean;
    }>;
    private buildPrunedTree;
    getActiveFilters(ownerId: string, payload: GetActiveFiltersPayload): Promise<ActiveFiltersResponse>;
    bulkPublishQuestions(ownerId: string, payload: BulkPublishQuestionPayload): Promise<{
        message: string;
        publishedCount: any;
    }>;
    getActiveFiltersForQuizBuilder(ownerId: string, payload: GetActiveFiltersPayload): Promise<ActiveFiltersResponse>;
}
