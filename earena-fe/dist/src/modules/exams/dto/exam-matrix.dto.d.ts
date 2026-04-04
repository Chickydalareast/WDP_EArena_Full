import { DifficultyLevel } from '../../questions/schemas/question.schema';
export declare class MatrixRuleDto {
    folderIds?: string[];
    topicIds?: string[];
    difficulties?: DifficultyLevel[];
    tags?: string[];
    limit: number;
}
export declare class MatrixSectionDto {
    name: string;
    orderIndex: number;
    rules: MatrixRuleDto[];
}
export declare class CreateExamMatrixDto {
    title: string;
    description?: string;
    subjectId: string;
    sections: MatrixSectionDto[];
}
export declare class UpdateExamMatrixDto {
    title?: string;
    description?: string;
    subjectId?: string;
    sections?: MatrixSectionDto[];
}
