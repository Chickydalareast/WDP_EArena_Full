import { Logger } from '@nestjs/common';
import { Connection, Model, Types } from 'mongoose';
import { AbstractRepository } from '../../common/database/abstract.repository';
import { QuestionDocument, DifficultyLevel } from './schemas/question.schema';
import { CandidatePool } from '../exams/interfaces/exam-generator.interface';
import { GetActiveFiltersPayload } from './interfaces/question.interface';
export type QuestionFilterParams = {
    page: number;
    limit: number;
    folderIds?: string[];
    topicId?: string;
    difficultyLevels?: DifficultyLevel[];
    search?: string;
    isDraft?: boolean;
};
export type RepoQuestionFilterParams = {
    page: number;
    limit: number;
    folderIds?: string[];
    topicIds?: string[];
    difficultyLevels?: DifficultyLevel[];
    tags?: string[];
    search?: string;
    isDraft?: boolean;
};
export declare class QuestionsRepository extends AbstractRepository<QuestionDocument> {
    private readonly questionModel;
    protected readonly logger: Logger;
    constructor(questionModel: Model<QuestionDocument>, connection: Connection);
    getRandomQuestions(folderIds: string[], topicId: string, difficulty: DifficultyLevel, limit: number): Promise<any[]>;
    getQuestionsPaginated(ownerId: string, filter: RepoQuestionFilterParams): Promise<{
        items: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findSubQuestionsByPassageId(passageIds: Types.ObjectId[]): Promise<QuestionDocument[]>;
    generateDynamicQuestions(dynamicConfig: any, optionalTopicId?: string): Promise<{
        questions: {
            originalQuestionId: any;
            type: any;
            parentPassageId: any;
            orderIndex: any;
            content: any;
            explanation: any;
            difficultyLevel: any;
            answers: any;
            attachedMedia: any;
            points: null;
        }[];
        answerKeys: {
            originalQuestionId: any;
            correctAnswerId: any;
        }[];
    }>;
    countValidQuestions(questionIds: string[], ownerId: string): Promise<number>;
    getCandidatePoolForRule(ownerId: Types.ObjectId, rule: any, excludeIds: Types.ObjectId[], poolSizeMultiplier?: number): Promise<CandidatePool>;
    countAvailableQuestionsForRule(ownerId: Types.ObjectId, rule: any, excludeIds: Types.ObjectId[]): Promise<number>;
    getActiveFiltersMetadata(ownerId: string, filters: GetActiveFiltersPayload): Promise<{
        folderIds: any;
        topicIds: any;
        difficulties: any;
        tags: any;
    }>;
    getPublishedActiveFiltersMetadata(ownerId: string, filters: GetActiveFiltersPayload): Promise<{
        folderIds: any;
        topicIds: any;
        difficulties: any;
        tags: any;
    }>;
}
