import { Logger } from '@nestjs/common';
import { Connection, Model } from 'mongoose';
import { AbstractRepository } from '../../common/database/abstract.repository';
import { ExamMatrixDocument } from './schemas/exam-matrix.schema';
export declare class ExamMatricesRepository extends AbstractRepository<ExamMatrixDocument> {
    protected readonly logger: Logger;
    constructor(model: Model<ExamMatrixDocument>, connection: Connection);
}
