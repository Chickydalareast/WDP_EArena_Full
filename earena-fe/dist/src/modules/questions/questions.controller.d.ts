import { QuestionsService } from './questions.service';
import { GetQuestionsDto } from './dto/get-questions.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { CloneQuestionDto } from './dto/clone-question.dto';
import { UpdatePassageDto } from './dto/update-passage.dto';
import { BulkCreateQuestionDto } from './dto/bulk-create-question.dto';
import { BulkStandardizeQuestionDto } from './dto/bulk-standardize-question.dto';
import { MoveQuestionsDto } from './dto/move-questions.dto';
import { BulkCloneQuestionDto } from './dto/bulk-clone-question.dto';
import { BulkDeleteQuestionDto } from './dto/bulk-delete-question.dto';
import { SuggestFolderDto } from './dto/suggest-folder.dto';
import { OrganizeQuestionsDto } from './dto/organize-questions.dto';
import { AutoTagQuestionsDto } from './dto/auto-tag-questions.dto';
import { ActiveFiltersDto } from './dto/active-filters.dto';
import { BulkPublishQuestionDto } from './dto/bulk-publish-question.dto';
export declare class QuestionsController {
    private readonly questionsService;
    constructor(questionsService: QuestionsService);
    getQuestions(userId: string, query: GetQuestionsDto): Promise<{
        items: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    createQuestion(userId: string, dto: CreateQuestionDto): Promise<{
        message: string;
        question: {
            id: import("mongoose").Types.ObjectId;
            content: string;
            type: import("./schemas/question.schema").QuestionType;
            attachedMedia: import("mongoose").Types.ObjectId[];
        };
    }>;
    bulkCreateQuestions(userId: string, dto: BulkCreateQuestionDto): Promise<{
        message: string;
        count: any;
        insertedIds: any;
    }>;
    bulkStandardizeQuestions(userId: string, dto: BulkStandardizeQuestionDto): Promise<{
        message: string;
    }>;
    moveQuestions(userId: string, dto: MoveQuestionsDto): Promise<{
        message: string;
    }>;
    bulkCloneQuestions(userId: string, dto: BulkCloneQuestionDto): Promise<{
        message: string;
        clonedRootCount: any;
        clonedSubCount: number;
    }>;
    bulkDeleteQuestions(userId: string, dto: BulkDeleteQuestionDto): Promise<{
        message: string;
        deletedCount: any;
    }>;
    suggestFoldersForMove(userId: string, dto: SuggestFolderDto): Promise<any[]>;
    bulkPublishQuestions(userId: string, dto: BulkPublishQuestionDto): Promise<{
        message: string;
        publishedCount: any;
    }>;
    updateQuestion(id: string, userId: string, dto: UpdateQuestionDto): Promise<any>;
    deleteQuestion(id: string, userId: string): Promise<{
        message: string;
    }>;
    cloneQuestion(id: string, userId: string, dto: CloneQuestionDto): Promise<{
        message: string;
        data: any;
    }>;
    updatePassageWithDiffing(passageId: string, userId: string, dto: UpdatePassageDto): Promise<{
        message: string;
        diffStats: {
            deleted: number;
            created: number;
            updated: number;
        };
    }>;
    previewOrganizeQuestions(userId: string, dto: OrganizeQuestionsDto): Promise<import("./interfaces/question-organizer.interface").OrganizePreviewResult>;
    executeOrganizeQuestions(userId: string, dto: OrganizeQuestionsDto): Promise<{
        message: string;
        stats: {
            totalQuestions: number;
            newFoldersToCreate: number;
            unclassifiedQuestions: number;
        };
    }>;
    bulkAutoTagQuestions(userId: string, dto: AutoTagQuestionsDto): Promise<{
        message: string;
        jobDispatched: boolean;
    }>;
    getActiveFilters(userId: string, dto: ActiveFiltersDto): Promise<{
        message: string;
        data: import("./interfaces/question.interface").ActiveFiltersResponse;
    }>;
}
