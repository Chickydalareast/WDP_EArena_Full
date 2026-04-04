import { MessageEvent } from '@nestjs/common';
import { Observable } from 'rxjs';
import { NotificationsService } from './notifications.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    streamNotifications(userId: string): Observable<MessageEvent>;
    getMyNotifications(userId: string, query: PaginationDto): Promise<{
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
    markAllAsRead(userId: string): Promise<{
        message: string;
    }>;
    markAsRead(userId: string, notificationId: string): Promise<{
        message: string;
    }>;
}
