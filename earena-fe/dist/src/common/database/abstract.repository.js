"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("mongoose");
const transaction_context_1 = require("./transaction.context");
class AbstractRepository {
    model;
    connection;
    constructor(model, connection) {
        this.model = model;
        this.connection = connection;
    }
    async create(document, options) {
        const createdDocument = new this.model({ ...document, _id: new mongoose_1.Types.ObjectId() });
        return (await createdDocument.save(options)).toJSON();
    }
    async findOne(filterQuery) {
        const document = await this.model.findOne(filterQuery, undefined, { lean: true });
        if (!document) {
            this.logger.warn('Document not found with filterQuery', filterQuery);
            throw new common_1.NotFoundException('Document not found.');
        }
        return document;
    }
    async exists(filterQuery) {
        const result = await this.model.exists(filterQuery);
        return !!result;
    }
    async findOneAndUpdate(filterQuery, update) {
        const document = await this.model.findOneAndUpdate(filterQuery, update, { lean: true, returnDocument: 'after' });
        if (!document) {
            throw new common_1.NotFoundException('Document not found.');
        }
        return document;
    }
    async startTransaction() {
        const session = await this.connection.startSession();
        session.startTransaction();
        return session;
    }
    get currentSession() {
        return transaction_context_1.transactionContext.getStore();
    }
    async executeInTransaction(operation) {
        const session = await this.connection.startSession();
        session.startTransaction();
        try {
            const result = await transaction_context_1.transactionContext.run(session, async () => {
                return await operation();
            });
            await session.commitTransaction();
            return result;
        }
        catch (error) {
            await session.abortTransaction();
            this.logger.error(`Transaction aborted: ${error instanceof Error ? error.message : error}`);
            throw error;
        }
        finally {
            await session.endSession();
        }
    }
    async createDocument(document, options) {
        const createdDocument = new this.model({
            ...document,
            _id: new mongoose_1.Types.ObjectId(),
        });
        return (await createdDocument.save({ session: this.currentSession, ...options })).toJSON();
    }
    async findOneSafe(filterQuery, options) {
        return this.model
            .findOne(filterQuery, undefined, { lean: true, session: this.currentSession, ...options })
            .exec();
    }
    async findByIdSafe(id, options) {
        return this.model
            .findById(new mongoose_1.Types.ObjectId(id.toString()), undefined, { lean: true, session: this.currentSession, ...options })
            .exec();
    }
    async updateByIdSafe(id, update, options) {
        return this.model
            .findByIdAndUpdate(new mongoose_1.Types.ObjectId(id.toString()), update, { lean: true, returnDocument: 'after', session: this.currentSession, ...options })
            .exec();
    }
    async deleteOneSafe(filterQuery, options) {
        const activeSession = options?.session ?? this.currentSession ?? undefined;
        return this.model
            .deleteOne(filterQuery, {
            ...options,
            session: activeSession
        })
            .exec();
    }
    async deleteManySafe(filterQuery, options) {
        const activeSession = options?.session ?? this.currentSession ?? undefined;
        return this.model
            .deleteMany(filterQuery, {
            ...options,
            session: activeSession
        })
            .exec();
    }
    async insertManySafe(docs, options) {
        const activeSession = options?.session ?? this.currentSession ?? undefined;
        return this.model.insertMany(docs, {
            ...options,
            session: activeSession,
        });
    }
    get modelInstance() {
        return this.model;
    }
}
exports.AbstractRepository = AbstractRepository;
//# sourceMappingURL=abstract.repository.js.map