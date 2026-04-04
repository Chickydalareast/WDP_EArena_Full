import { Types } from 'mongoose';
import { ExamMatricesRepository } from './exam-matrices.repository';
import { ExamsRepository } from './exams.repository';
import { CreateMatrixPayload, GetMatricesFilter, UpdateMatrixPayload, CloneMatrixResult } from './interfaces/exam-matrix.interface';
export declare class ExamMatricesService {
    private readonly matricesRepo;
    private readonly examsRepo;
    private readonly logger;
    constructor(matricesRepo: ExamMatricesRepository, examsRepo: ExamsRepository);
    createMatrixTemplate(teacherId: string, payload: CreateMatrixPayload): Promise<{
        message: string;
        matrixId: Types.ObjectId;
    }>;
    getMatrices(teacherId: string, filter: GetMatricesFilter): Promise<{
        items: (import("./schemas/exam-matrix.schema").ExamMatrix & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getMatrixDetail(matrixId: string, teacherId: string): Promise<import("./schemas/exam-matrix.schema").ExamMatrixDocument>;
    updateMatrix(matrixId: string, teacherId: string, payload: UpdateMatrixPayload): Promise<{
        message: string;
        matrixId: Types.ObjectId | undefined;
    }>;
    cloneMatrix(matrixId: string, teacherId: string): Promise<CloneMatrixResult>;
    deleteMatrix(matrixId: string, teacherId: string): Promise<{
        message: string;
    }>;
}
