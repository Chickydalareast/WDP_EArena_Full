import { DifficultyLevel } from '../schemas/question.schema';
export declare class BulkStandardizeQuestionDto {
    questionIds: string[];
    topicId: string;
    difficultyLevel: DifficultyLevel;
    autoOrganize?: boolean;
}
