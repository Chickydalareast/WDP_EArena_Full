import { Injectable, Logger } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection, Types, QueryFilter, ClientSession } from 'mongoose';
import * as crypto from 'crypto';
import { AbstractRepository } from '../../common/database/abstract.repository';
import { Token } from './schemas/token.schema';

@Injectable()
export class TokenRepository extends AbstractRepository<Token> {
  protected readonly logger = new Logger(TokenRepository.name);

  constructor(
    @InjectModel(Token.name) tokenModel: Model<Token>,
    @InjectConnection() connection: Connection,
  ) {
    super(tokenModel, connection);
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async saveToken(
    token: string, 
    userId: string | Types.ObjectId,
    expiresAt: Date,
    session?: ClientSession
  ): Promise<Token> {
    const hashedToken = this.hashToken(token); 

    return this.createDocument({
      token: hashedToken, 
      userId: new Types.ObjectId(userId.toString()),
      type: 'refresh',
      expiresAt,
    }, { session });
  }

  async findByToken(token: string): Promise<Token | null> {
    const hashedToken = this.hashToken(token);
    return this.findOneSafe({ token: hashedToken } as QueryFilter<Token>);
  }

  async deleteByToken(token: string): Promise<boolean> {
    const hashedToken = this.hashToken(token); 
    const result = await this.model.deleteOne({ token: hashedToken } as QueryFilter<Token>);
    return result.deletedCount > 0;
  }

  async deleteAllByUserId(userId: string | Types.ObjectId): Promise<boolean> {
    const result = await this.model.deleteMany({
      userId: new Types.ObjectId(userId.toString())
    } as QueryFilter<Token>);
    return result.deletedCount > 0;
  }
}