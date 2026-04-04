import { Types } from 'mongoose';
import { DifficultyLevel } from '../../questions/schemas/question.schema';
export interface MatrixRulePayload {
    folderIds?: string[];
    topicIds?: string[];
    difficulties?: DifficultyLevel[];
    tags?: string[];
    limit: number;
}
export interface MatrixSectionPayload {
    name: string;
    orderIndex: number;
    rules: MatrixRulePayload[];
}
export interface CreateMatrixPayload {
    title: string;
    description?: string;
    subjectId: string;
    sections: MatrixSectionPayload[];
}
export interface UpdateMatrixPayload extends Partial<CreateMatrixPayload> {
}
export interface GetMatricesFilter {
    page: number;
    limit: number;
    subjectId?: string;
    search?: string;
}
export interface CloneMatrixResult {
    message: string;
    matrixId: Types.ObjectId;
}
