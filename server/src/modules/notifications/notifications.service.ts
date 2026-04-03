import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
  Inject,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Subject, Observable } from 'rxjs';
import Redis from 'ioredis';
import { NotificationsRepository } from './repositories/notifications.repository';
import { CreateNotificationInput } from './interfaces/notification.interface';

// Format chuẩn của một Server-Sent Event
export interface SseMessageEvent {
  data: string | object;
  id?: string;
  type?: string;
  retry?: number;
}

@Injectable()
export class NotificationsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NotificationsService.name);

  // Lưu trữ các kết nối SSE đang mở. Key: userId
  private readonly sseConnections = new Map<string, Subject<SseMessageEvent>>();

  // Client chuyên dụng để LẮNG NGHE (Subscribe)
  private redisSubscriber: Redis;
  private readonly REDIS_CHANNEL = 'earena_notifications';

  constructor(
    private readonly notificationsRepo: NotificationsRepository,
    private readonly configService: ConfigService,
    // Inject Client mặc định để GỬI (Publish)
    @Inject('REDIS_CLIENT') private readonly redisPublisher: Redis,
  ) {}

  onModuleInit() {
    this.initRedisSubscriber();
  }

  onModuleDestroy() {
    this.redisSubscriber?.disconnect();
    // Đóng toàn bộ SSE connections khi server shutdown
    this.sseConnections.forEach((subject) => subject.complete());
    this.sseConnections.clear();
  }

  private initRedisSubscriber() {
    // [CTO FIX]: Khởi tạo Client lắng nghe bằng pattern .duplicate()
    // Kế thừa 100% bảo mật (host, port, password) từ Client gốc, NHƯNG đè lại các cờ gây xung đột
    this.redisSubscriber = this.redisPublisher.duplicate({
      enableReadyCheck: false, // TUYỆT ĐỐI QUAN TRỌNG: Tắt lệnh INFO tự động để không đụng độ Subscriber Mode
      enableOfflineQueue: false, // Không ôm rác vào RAM nếu rớt mạng dài hạn
    });

    this.redisSubscriber.on('connect', () => {
      this.logger.log('🚀 Redis Subscriber (Pub/Sub) Connected Successfully');
      this.redisSubscriber.subscribe(this.REDIS_CHANNEL, (err, count) => {
        if (err) {
          this.logger.error('Lỗi khi subscribe channel Redis:', err);
        } else {
          this.logger.log(
            `[SSE] Đã mở trạm thu sóng Redis trên channel: ${this.REDIS_CHANNEL} (Count: ${count})`,
          );
        }
      });
    });

    // [CTO FIX]: Bắt buộc phải có hàm này để Node.js không bị văng "Unhandled error event" làm sập process
    this.redisSubscriber.on('error', (err) => {
      this.logger.error(
        `[Redis Subscriber Error] Lỗi kết nối ngầm: ${err.message}`,
      );
    });

    // Lắng nghe tín hiệu từ các Server/Instance khác
    this.redisSubscriber.on('message', (channel, message) => {
      if (channel === this.REDIS_CHANNEL) {
        this.dispatchToClient(JSON.parse(message));
      }
    });
  }

  // =========================================================================
  // VÙNG QUẢN LÝ SSE CONNECTIONS
  // =========================================================================

  /**
   * Tạo kênh kết nối SSE cho một User
   */
  subscribeToNotifications(userId: string): Observable<SseMessageEvent> {
    // Nếu user đã có connection ở thiết bị khác, ta có thể ghi đè hoặc giữ dạng Array.
    // Ở đây dùng ghi đè (hoặc tạo mới) cho đơn giản, nếu muốn hỗ trợ multi-device thì dùng Map<string, Subject[]>
    let subject = this.sseConnections.get(userId);
    if (!subject) {
      subject = new Subject<SseMessageEvent>();
      this.sseConnections.set(userId, subject);
    }
    return subject.asObservable();
  }

  /**
   * Xóa connection khỏi RAM khi client ngắt kết nối
   */
  removeConnection(userId: string) {
    const subject = this.sseConnections.get(userId);
    if (subject) {
      subject.complete();
      this.sseConnections.delete(userId);
      this.logger.debug(`[SSE] Đã đóng kết nối của User: ${userId}`);
    }
  }

  // =========================================================================
  // VÙNG XỬ LÝ NGHIỆP VỤ & BROKER
  // =========================================================================

  /**
   * Đẩy event vào Subject của User hiện tại (nếu họ đang online trên instance này)
   */
  private dispatchToClient(notification: any) {
    const receiverIdStr = notification.receiverId.toString();
    const subject = this.sseConnections.get(receiverIdStr);

    if (subject) {
      subject.next({
        type: notification.type,
        data: notification,
      });
    }
  }

  /**
   * Hàm Core dùng để tạo thông báo mới (được gọi từ các module khác qua Event Listener)
   */
  async createAndDispatch(input: CreateNotificationInput) {
    // 1. Lưu vào Database
    const notification = await this.notificationsRepo.createDocument({
      receiverId: input.receiverId, // Đã được cast sang ObjectId ở Repo (hoặc truyền raw string tùy setup)
      senderId: input.senderId || null,
      type: input.type,
      title: input.title,
      message: input.message,
      payload: input.payload || {},
      isRead: false,
    });

    // 2. Publish tín hiệu ra toàn bộ hạ tầng Redis (để instance nào đang giữ User đó thì bắn SSE)
    await this.redisPublisher.publish(
      this.REDIS_CHANNEL,
      JSON.stringify(notification),
    );

    return notification;
  }

  async getUserNotifications(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const filter = { receiverId: userId };

    // [MAX PING]: Chạy song song 3 truy vấn I/O cùng một lúc để tối đa hóa tốc độ (Concurrent Processing)
    const [items, total, unreadCount] = await Promise.all([
      this.notificationsRepo.modelInstance
        .find(filter)
        .sort({ createdAt: -1 }) // Mới nhất lên đầu
        .skip(skip)
        .limit(limit)
        .lean() // BẮT BUỘC: Giảm overhead RAM của Mongoose
        .exec(),
      this.notificationsRepo.modelInstance.countDocuments(filter).exec(),
      this.notificationsRepo.countUnread(userId), // Gọi hàm đóng gói từ Repo
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        unreadCount, // Đã bổ sung thành công theo đúng yêu cầu của FE
      },
    };
  }

  async markAsRead(userId: string, notificationId: string) {
    const updated = await this.notificationsRepo.updateByIdSafe(
      notificationId,
      { $set: { isRead: true } },
      // Đảm bảo chỉ user sở hữu mới được update (Chống IDOR)
      { filter: { receiverId: userId } } as any,
    );
    return updated;
  }

  async markAllAsRead(userId: string) {
    await this.notificationsRepo.markAllAsReadForUser(userId);
    return { success: true };
  }
}
