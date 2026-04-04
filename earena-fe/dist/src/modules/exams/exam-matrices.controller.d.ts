import { ExamMatricesService } from './exam-matrices.service';
import { CreateExamMatrixDto, UpdateExamMatrixDto } from './dto/exam-matrix.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class ExamMatricesController {
    private readonly matricesService;
    constructor(matricesService: ExamMatricesService);
    createMatrix(dto: CreateExamMatrixDto, userId: string): Promise<{
        message: string;
        matrixId: import("mongoose").Types.ObjectId;
    }>;
    getMatrices(query: PaginationDto & {
        subjectId?: string;
        search?: string;
    }, userId: string): Promise<{
        items: (import("./schemas/exam-matrix.schema").ExamMatrix & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
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
    getMatrixDetail(id: string, userId: string): Promise<import("./schemas/exam-matrix.schema").ExamMatrixDocument>;
    deleteMatrix(id: string, userId: string): Promise<{
        message: string;
    }>;
    updateMatrix(id: string, dto: UpdateExamMatrixDto, userId: string): Promise<{
        message: string;
        matrixId: import("mongoose").Types.ObjectId | undefined;
    }>;
    cloneMatrix(id: string, userId: string): Promise<import("./interfaces/exam-matrix.interface").CloneMatrixResult>;
}
