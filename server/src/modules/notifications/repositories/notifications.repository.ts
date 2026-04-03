import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types, UpdateQuery, QueryOptions } from 'mongoose';
import { AbstractRepository } from '../../../common/database/abstract.repository';
import { Notification } from '../schemas/notification.schema';

@Injectable()
export class NotificationsRepository extends AbstractRepository<Notification> {
  protected readonly logger = new Logger(NotificationsRepository.name);

  constructor(
    @InjectModel(Notification.name) model: Model<Notification>,
    @InjectConnection() connection: Connection,
  ) {
    super(model, connection);
  }

  // [CTO ADD-ON]: Bổ sung hàm updateMany an toàn với Session do AbstractRepository đang thiếu
  async updateManySafe(
    filterQuery: Record<string, any>,
    update: UpdateQuery<Notification>,
    options?: QueryOptions<Notification>,
  ): Promise<any> {
    const activeSession = options?.session ?? this.currentSession ?? undefined;

    return this.modelInstance
      .updateMany(filterQuery, update, {
        ...options,
        session: activeSession,
      } as any)
      .exec();
  }

  // Tiện ích nghiệp vụ: Đánh dấu tất cả đã đọc
  async markAllAsReadForUser(userId: string): Promise<void> {
    await this.updateManySafe(
      { receiverId: new Types.ObjectId(userId), isRead: false },
      { $set: { isRead: true } },
    );
  }

  async countUnread(userId: string): Promise<number> {
    return this.modelInstance
      .countDocuments({
        receiverId: new Types.ObjectId(userId),
        isRead: false,
      })
      .exec();
  }
}
