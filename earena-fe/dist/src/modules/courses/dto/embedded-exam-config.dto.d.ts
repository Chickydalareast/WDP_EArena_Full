import { DifficultyLevel } from '../../questions/schemas/question.schema';
export declare class EmbeddedExamRuleDto {
    folderIds?: string[];
    topicIds?: string[];
    difficulties?: DifficultyLevel[];
    tags?: string[];
    limit: number;
}
export declare class EmbeddedExamSectionDto {
    name: string;
    orderIndex: number;
    rules: EmbeddedExamRuleDto[];
}
export declare class EmbeddedExamConfigDto {
    title: string;
    totalScore: number;
    matrixId?: string;
    adHocSections?: EmbeddedExamSectionDto[];
}
