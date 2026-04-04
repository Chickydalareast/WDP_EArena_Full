import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import Redis from 'ioredis';
import { NotificationsRepository } from './repositories/notifications.repository';
import { CreateNotificationInput } from './interfaces/notification.interface';
export interface SseMessageEvent {
    data: string | object;
    id?: string;
    type?: string;
    retry?: number;
}
export declare class NotificationsService implements OnModuleInit, OnModuleDestroy {
    private readonly notificationsRepo;
    private readonly configService;
    private readonly redisPublisher;
    private readonly logger;
    private readonly sseConnections;
    private redisSubscriber;
    private readonly REDIS_CHANNEL;
    private readonly CHAT_CHANNEL;
    constructor(notificationsRepo: NotificationsRepository, configService: ConfigService, redisPublisher: Redis);
    onModuleInit(): void;
    onModuleDestroy(): void;
    private initRedisSubscriber;
    subscribeToNotifications(userId: string): Observable<SseMessageEvent>;
    removeConnection(userId: string): void;
    private dispatchToClient;
    private dispatchChatToClient;
    publishChatFanout(payload: {
        receiverId: string;
        threadId: string;
        message: unknown;
    }): Promise<number>;
    createAndDispatch(input: CreateNotificationInput): Promise<import("./schemas/notification.schema").Notification>;
    getUserNotifications(userId: string, page: number, limit: number): Promise<{
        items: (import("./schemas/notification.schema").Notification & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            unreadCount: number;
        };
    }>;
    markAsRead(userId: string, notificationId: string): Promise<import("./schemas/notification.schema").Notification | null>;
    markAllAsRead(userId: string): Promise<{
        success: boolean;
    }>;
}
