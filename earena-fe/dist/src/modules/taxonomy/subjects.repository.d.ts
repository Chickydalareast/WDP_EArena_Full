import { Logger } from '@nestjs/common';
import { Connection, Model } from 'mongoose';
import { AbstractRepository } from '../../common/database/abstract.repository';
import { SubjectDocument } from './schemas/subject.schema';
export declare class SubjectsRepository extends AbstractRepository<SubjectDocument> {
    protected readonly logger: Logger;
    constructor(model: Model<SubjectDocument>, connection: Connection);
}
