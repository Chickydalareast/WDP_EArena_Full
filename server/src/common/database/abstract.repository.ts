import { Logger, NotFoundException } from '@nestjs/common';
import {
  Model,
  Types,
  UpdateQuery,
  SaveOptions,
  Connection,
  ClientSession,
  QueryFilter, 
} from 'mongoose';
import { Document } from 'mongoose';

export abstract class AbstractRepository<TDocument extends Document> {
  protected abstract readonly logger: Logger;

  constructor(
    protected readonly model: Model<TDocument>,
    private readonly connection: Connection,
  ) {}

  async create(
    document: Omit<TDocument, '_id'>,
    options?: SaveOptions,
  ): Promise<TDocument> {
    const createdDocument = new this.model({
      ...document,
      _id: new Types.ObjectId(),
    });
    return (
      await createdDocument.save(options)
    ).toJSON() as unknown as TDocument;
  }

  async findOne(filterQuery: QueryFilter<TDocument>): Promise<TDocument> {
    const document = await this.model.findOne(filterQuery, {}, { lean: true });

    if (!document) {
      this.logger.warn('Document not found with filterQuery', filterQuery);
      throw new NotFoundException('Document not found.');
    }

    return document as unknown as TDocument;
  }

  async exists(filterQuery: QueryFilter<TDocument>): Promise<boolean> {
    const result = await this.model.exists(filterQuery);
    return !!result;
  }

  async findOneAndUpdate(
    filterQuery: QueryFilter<TDocument>,
    update: UpdateQuery<TDocument>,
  ): Promise<TDocument> {
    const document = await this.model.findOneAndUpdate(filterQuery, update, {
      lean: true,
      new: true,
    });

    if (!document) {
      this.logger.warn('Document not found with filterQuery', filterQuery);
      throw new NotFoundException('Document not found.');
    }

    return document as unknown as TDocument;
  }

  async find(filterQuery: QueryFilter<TDocument>): Promise<TDocument[]> {
    return this.model.find(filterQuery, {}, { lean: true }) as unknown as TDocument[];
  }

  async startTransaction(): Promise<ClientSession> {
    const session = await this.connection.startSession();
    session.startTransaction();
    return session;
  }
}