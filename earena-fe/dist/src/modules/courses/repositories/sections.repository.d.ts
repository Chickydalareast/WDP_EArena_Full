import { Logger } from '@nestjs/common';
import { Connection, Model, Types } from 'mongoose';
import { AbstractRepository } from '../../../common/database/abstract.repository';
import { SectionDocument } from '../schemas/section.schema';
export declare class SectionsRepository extends AbstractRepository<SectionDocument> {
    private readonly sectionModel;
    protected readonly logger: Logger;
    constructor(sectionModel: Model<SectionDocument>, connection: Connection);
    getNextOrder(courseId: string | Types.ObjectId): Promise<number>;
    bulkUpdateOrder(updates: {
        id: string;
        order: number;
    }[]): Promise<any>;
    bulkUpdateOrderAndSection(updates: {
        id: string;
        order: number;
        sectionId: string;
    }[]): Promise<any>;
    bulkUpdateOrderStrict(courseId: string, updates: {
        id: string;
        order: number;
    }[]): Promise<any>;
}
