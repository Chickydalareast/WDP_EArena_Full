import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { AbstractRepository } from '../../common/database/abstract.repository';
import { KnowledgeTopic, KnowledgeTopicDocument } from './schemas/knowledge-topic.schema';

@Injectable()
export class KnowledgeTopicsRepository extends AbstractRepository<KnowledgeTopicDocument> {
  protected readonly logger = new Logger(KnowledgeTopicsRepository.name);

  constructor(
    @InjectModel(KnowledgeTopic.name) model: Model<KnowledgeTopicDocument>,
    @InjectConnection() connection: Connection,
  ) {
    super(model, connection);
  }
}