import { Injectable, Logger } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection, Types, QueryFilter } from 'mongoose';
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

  /**
   * Sinh Refresh Token mới và lưu vào DB
   */
  async saveToken(token: string, userId: string | Types.ObjectId, expiresAt: Date): Promise<Token> {
    return this.create({
      token,
      userId: new Types.ObjectId(userId.toString()),
      type: 'refresh',
      expiresAt,
    } as unknown as Omit<Token, '_id'>);
  }

  /**
   * Lấy Refresh Token. 
   * Trả về null nếu không tìm thấy thay vì văng Exception để Service dễ xử lý logic.
   */
  async findByToken(token: string): Promise<Token | null> {
    try {
      // Ép kiểu QueryFilter chuẩn Mongoose v9
      return await this.findOne({ token } as QueryFilter<Token>);
    } catch (error) {
      return null; // Bắt NotFoundException từ AbstractRepository
    }
  }

  /**
   * Xóa 1 Token cụ thể (Dùng cho tính năng Logout thiết bị hiện tại)
   */
  async deleteToken(token: string): Promise<void> {
    // AbstractRepository chưa có deleteOne, ta chọc thẳng vào this.model
    await this.model.deleteOne({ token } as QueryFilter<Token>);
  }

  /**
   * Xóa toàn bộ Token của 1 User (Dùng cho tính năng Logout All Devices hoặc Block User)
   */
  async deleteAllByUserId(userId: string | Types.ObjectId): Promise<void> {
    await this.model.deleteMany({ 
        userId: new Types.ObjectId(userId.toString()) 
    } as QueryFilter<Token>);
  }

  async deleteAllTokensForUser(userId: string): Promise<void> {
    await (this as any).model.deleteMany({ userId: new Types.ObjectId(userId) });
  }
}