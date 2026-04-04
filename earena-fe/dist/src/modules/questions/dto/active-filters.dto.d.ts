import { DifficultyLevel } from '../schemas/question.schema';
export declare class ActiveFiltersDto {
    folderIds?: string[];
    topicIds?: string[];
    difficulties?: DifficultyLevel[];
    tags?: string[];
    isDraft?: boolean;
}
