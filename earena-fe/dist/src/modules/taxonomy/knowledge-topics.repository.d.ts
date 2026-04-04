import { Logger } from '@nestjs/common';
import { Connection, Model } from 'mongoose';
import { AbstractRepository } from '../../common/database/abstract.repository';
import { KnowledgeTopicDocument } from './schemas/knowledge-topic.schema';
export declare class KnowledgeTopicsRepository extends AbstractRepository<KnowledgeTopicDocument> {
    protected readonly logger: Logger;
    constructor(model: Model<KnowledgeTopicDocument>, connection: Connection);
}
