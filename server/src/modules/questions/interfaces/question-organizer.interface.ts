import { Types } from 'mongoose';
import { DifficultyLevel } from '../schemas/question.schema';

export enum OrganizeStrategy {
    TOPIC_STRICT = 'TOPIC_STRICT',
    TOPIC_AND_DIFFICULTY = 'TOPIC_AND_DIFFICULTY',
    FLAT_DIFFICULTY = 'FLAT_DIFFICULTY',
}

export interface PreviewOrganizePayload {
    questionIds: string[];
    strategy: OrganizeStrategy;
    baseFolderId?: string;
}

export interface VirtualFolderNode {
    _id: Types.ObjectId;
    name: string;
    parentId: Types.ObjectId | null;
    ancestors: Types.ObjectId[];
    isNew: boolean;
    children?: VirtualFolderNode[];
}

export interface QuestionMapping {
    questionId: Types.ObjectId;
    targetFolderId: Types.ObjectId;
}

export interface OrganizePreviewResult {
    strategyUsed: OrganizeStrategy;
    virtualTree: VirtualFolderNode[];
    mappings: QuestionMapping[];
    stats: {
        totalQuestions: number;
        newFoldersToCreate: number;
        unclassifiedQuestions: number;
    };
}