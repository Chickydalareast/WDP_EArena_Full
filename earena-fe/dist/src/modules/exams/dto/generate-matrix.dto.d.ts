import { DifficultyLevel } from '../../questions/schemas/question.schema';
declare class MatrixCriterionDto {
    folderIds: string[];
    topicId: string;
    difficulty: DifficultyLevel;
    limit: number;
}
export declare class GenerateMatrixDto {
    title: string;
    totalScore: number;
    criteria: MatrixCriterionDto[];
}
export {};
