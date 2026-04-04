import { Logger } from '@nestjs/common';
import { Model, Connection, Types, ClientSession } from 'mongoose';
import { AbstractRepository } from '../../common/database/abstract.repository';
import { Token } from './schemas/token.schema';
export declare class TokenRepository extends AbstractRepository<Token> {
    protected readonly logger: Logger;
    constructor(tokenModel: Model<Token>, connection: Connection);
    private hashToken;
    saveToken(token: string, userId: string | Types.ObjectId, expiresAt: Date, session?: ClientSession): Promise<Token>;
    findByToken(token: string): Promise<Token | null>;
    deleteByToken(token: string): Promise<boolean>;
    deleteAllByUserId(userId: string | Types.ObjectId): Promise<boolean>;
}
