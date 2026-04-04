import { Logger } from '@nestjs/common';
import { Connection, Model, UpdateQuery, QueryOptions } from 'mongoose';
import { AbstractRepository } from '../../../common/database/abstract.repository';
import { Notification } from '../schemas/notification.schema';
export declare class NotificationsRepository extends AbstractRepository<Notification> {
    protected readonly logger: Logger;
    constructor(model: Model<Notification>, connection: Connection);
    updateManySafe(filterQuery: Record<string, any>, update: UpdateQuery<Notification>, options?: QueryOptions<Notification>): Promise<any>;
    markAllAsReadForUser(userId: string): Promise<void>;
    countUnread(userId: string): Promise<number>;
}
