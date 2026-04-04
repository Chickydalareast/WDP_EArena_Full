import { Logger, NotFoundException } from '@nestjs/common';
import mongoose, {
  Model,
  Types,
  UpdateQuery,
  SaveOptions,
  Connection,
  ClientSession,
  QueryFilter,
  QueryOptions,
  AnyKeys,
  Document,
} from 'mongoose';
import { transactionContext } from './transaction.context';

export abstract class AbstractRepository<TDocument extends Document> {
  protected abstract readonly logger: Logger;

  constructor(
    protected readonly model: Model<TDocument>,
    private readonly connection: Connection,
  ) { }

  // =========================================================================
  // VÙNG CODE LEGACY (DEPRECATED) - Giữ lại để tránh Domino Conflict
  // =========================================================================

  /** @deprecated Hệ thống cũ đang dùng, sẽ gỡ bỏ ở Phase 2. Chuyển sang dùng createDocument. */
  async create(document: Omit<TDocument, '_id'>, options?: SaveOptions): Promise<TDocument> {
    const createdDocument = new this.model({ ...document, _id: new Types.ObjectId() });
    return (await createdDocument.save(options)).toJSON() as unknown as TDocument;
  }

  /** @deprecated Chuyển sang dùng findOneSafe. */
  async findOne(filterQuery: QueryFilter<TDocument>): Promise<TDocument> {
    const document = await this.model.findOne(filterQuery, undefined, { lean: true });
    if (!document) {
      this.logger.warn('Document not found with filterQuery', filterQuery);
      throw new NotFoundException('Document not found.');
    }
    return document as unknown as TDocument;
  }

  /** @deprecated Chuyển sang logic countDocuments hoặc exists của mongoose. */
  async exists(filterQuery: QueryFilter<TDocument>): Promise<boolean> {
    const result = await this.model.exists(filterQuery);
    return !!result;
  }

  /** @deprecated Chuyển sang dùng updateByIdSafe. */
  async findOneAndUpdate(filterQuery: QueryFilter<TDocument>, update: UpdateQuery<TDocument>): Promise<TDocument> {
    const document = await this.model.findOneAndUpdate(filterQuery, update, { lean: true, returnDocument: 'after' });
    if (!document) {
      throw new NotFoundException('Document not found.');
    }
    return document as unknown as TDocument;
  }

  /** @deprecated Tránh truyền session bằng tay. Chuyển sang dùng executeInTransaction. */
  async startTransaction(): Promise<ClientSession> {
    const session = await this.connection.startSession();
    session.startTransaction();
    return session;
  }

  // =========================================================================
  // VÙNG CODE ENTERPRISE (MAX PING) - Tự động Contextual Session
  // =========================================================================

  protected get currentSession(): ClientSession | undefined {
    return transactionContext.getStore();
  }

  async executeInTransaction<T>(operation: () => Promise<T>): Promise<T> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const result = await transactionContext.run(session, async () => {
        return await operation();
      });
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      this.logger.error(`Transaction aborted: ${error instanceof Error ? error.message : error}`);
      throw error;
    } finally {
      await session.endSession();
    }
  }

  async createDocument(document: AnyKeys<TDocument>, options?: SaveOptions): Promise<TDocument> {
    const createdDocument = new this.model({
      ...document,
      _id: new Types.ObjectId(),
    });
    return (await createdDocument.save({ session: this.currentSession, ...options })).toJSON() as TDocument;
  }

  async findOneSafe(filterQuery: QueryFilter<TDocument>, options?: QueryOptions<TDocument>): Promise<TDocument | null> {
    return this.model
      .findOne(filterQuery, undefined, { lean: true, session: this.currentSession, ...options })
      .exec() as Promise<TDocument | null>;
  }

  async findByIdSafe(id: string | Types.ObjectId, options?: QueryOptions<TDocument>): Promise<TDocument | null> {
    return this.model
      .findById(new Types.ObjectId(id.toString()), undefined, { lean: true, session: this.currentSession, ...options })
      .exec() as Promise<TDocument | null>;
  }

  async updateByIdSafe(id: string | Types.ObjectId, update: UpdateQuery<TDocument>, options?: QueryOptions<TDocument>): Promise<TDocument | null> {
    return this.model
      .findByIdAndUpdate(new Types.ObjectId(id.toString()), update, { lean: true, returnDocument: 'after', session: this.currentSession, ...options })
      .exec() as Promise<TDocument | null>;
  }

  async deleteOneSafe(
    filterQuery: QueryFilter<TDocument>,
    options?: QueryOptions<TDocument>
  ): Promise<any> {
    const activeSession = options?.session ?? this.currentSession ?? undefined;

    return this.model
      .deleteOne(filterQuery, {
        ...options,
        session: activeSession
      } as any)
      .exec();
  }

  async deleteManySafe(
    filterQuery: QueryFilter<TDocument>,
    options?: QueryOptions<TDocument>
  ): Promise<any> {
    const activeSession = options?.session ?? this.currentSession ?? undefined;

    return this.model
      .deleteMany(filterQuery, {
        ...options,
        session: activeSession
      } as any)
      .exec();
  }

  async insertManySafe(
    docs: AnyKeys<TDocument>[],
    options?: mongoose.InsertManyOptions
  ): Promise<TDocument[]> {
    const activeSession = options?.session ?? this.currentSession ?? undefined;
    return this.model.insertMany(docs, {
      ...options,
      session: activeSession,
    }) as unknown as Promise<TDocument[]>;
  }

  get modelInstance(): Model<TDocument> {
    return this.model;
  }
}