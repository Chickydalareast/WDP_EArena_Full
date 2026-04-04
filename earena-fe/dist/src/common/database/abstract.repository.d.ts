import { Logger } from '@nestjs/common';
import mongoose, { Model, Types, UpdateQuery, SaveOptions, Connection, ClientSession, QueryFilter, QueryOptions, AnyKeys, Document } from 'mongoose';
export declare abstract class AbstractRepository<TDocument extends Document> {
    protected readonly model: Model<TDocument>;
    private readonly connection;
    protected abstract readonly logger: Logger;
    constructor(model: Model<TDocument>, connection: Connection);
    create(document: Omit<TDocument, '_id'>, options?: SaveOptions): Promise<TDocument>;
    findOne(filterQuery: QueryFilter<TDocument>): Promise<TDocument>;
    exists(filterQuery: QueryFilter<TDocument>): Promise<boolean>;
    findOneAndUpdate(filterQuery: QueryFilter<TDocument>, update: UpdateQuery<TDocument>): Promise<TDocument>;
    startTransaction(): Promise<ClientSession>;
    protected get currentSession(): ClientSession | undefined;
    executeInTransaction<T>(operation: () => Promise<T>): Promise<T>;
    createDocument(document: AnyKeys<TDocument>, options?: SaveOptions): Promise<TDocument>;
    findOneSafe(filterQuery: QueryFilter<TDocument>, options?: QueryOptions<TDocument>): Promise<TDocument | null>;
    findByIdSafe(id: string | Types.ObjectId, options?: QueryOptions<TDocument>): Promise<TDocument | null>;
    updateByIdSafe(id: string | Types.ObjectId, update: UpdateQuery<TDocument>, options?: QueryOptions<TDocument>): Promise<TDocument | null>;
    deleteOneSafe(filterQuery: QueryFilter<TDocument>, options?: QueryOptions<TDocument>): Promise<any>;
    deleteManySafe(filterQuery: QueryFilter<TDocument>, options?: QueryOptions<TDocument>): Promise<any>;
    insertManySafe(docs: AnyKeys<TDocument>[], options?: mongoose.InsertManyOptions): Promise<TDocument[]>;
    get modelInstance(): Model<TDocument>;
}
