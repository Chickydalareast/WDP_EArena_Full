import { Logger } from '@nestjs/common';
import { Connection, Model } from 'mongoose';
import { AbstractRepository } from '../../common/database/abstract.repository';
import { ExamDocument, ExamType } from './schemas/exam.schema';
export declare class ExamsRepository extends AbstractRepository<ExamDocument> {
    protected readonly logger: Logger;
    constructor(model: Model<ExamDocument>, connection: Connection);
    getExamsWithPagination(teacherId: string, page: number, limit: number, search?: string, type?: ExamType, subjectId?: string): Promise<{
        items: any;
        total: any;
    }>;
}
