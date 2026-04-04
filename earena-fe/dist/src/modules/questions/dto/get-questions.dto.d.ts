import { DifficultyLevel } from '../schemas/question.schema';
export declare class GetQuestionsDto {
    page?: number;
    limit?: number;
    folderIds?: string[];
    topicIds?: string[];
    difficultyLevels?: DifficultyLevel[];
    tags?: string[];
    search?: string;
    isDraft?: boolean;
}
