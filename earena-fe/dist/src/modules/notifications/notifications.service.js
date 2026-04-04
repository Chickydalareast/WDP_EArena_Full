"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const rxjs_1 = require("rxjs");
const ioredis_1 = __importDefault(require("ioredis"));
const notifications_repository_1 = require("./repositories/notifications.repository");
let NotificationsService = NotificationsService_1 = class NotificationsService {
    notificationsRepo;
    configService;
    redisPublisher;
    logger = new common_1.Logger(NotificationsService_1.name);
    sseConnections = new Map();
    redisSubscriber;
    REDIS_CHANNEL = 'earena_notifications';
    CHAT_CHANNEL = 'earena_chat';
    constructor(notificationsRepo, configService, redisPublisher) {
        this.notificationsRepo = notificationsRepo;
        this.configService = configService;
        this.redisPublisher = redisPublisher;
    }
    onModuleInit() {
        this.initRedisSubscriber();
    }
    onModuleDestroy() {
        this.redisSubscriber?.disconnect();
        this.sseConnections.forEach((subject) => subject.complete());
        this.sseConnections.clear();
    }
    initRedisSubscriber() {
        this.redisSubscriber = this.redisPublisher.duplicate({
            enableReadyCheck: false,
            enableOfflineQueue: false,
        });
        this.redisSubscriber.on('connect', () => {
            this.logger.log('🚀 Redis Subscriber (Pub/Sub) Connected Successfully');
            this.redisSubscriber.subscribe(this.REDIS_CHANNEL, this.CHAT_CHANNEL, (err, count) => {
                if (err) {
                    this.logger.error('Lỗi khi subscribe channel Redis:', err);
                }
                else {
                    this.logger.log(`[SSE] Redis subscriber: ${this.REDIS_CHANNEL}, ${this.CHAT_CHANNEL} (Count: ${count})`);
                }
            });
        });
        this.redisSubscriber.on('error', (err) => {
            this.logger.error(`[Redis Subscriber Error] Lỗi kết nối ngầm: ${err.message}`);
        });
        this.redisSubscriber.on('message', (channel, message) => {
            if (channel === this.REDIS_CHANNEL) {
                this.dispatchToClient(JSON.parse(message));
            }
            else if (channel === this.CHAT_CHANNEL) {
                try {
                    this.dispatchChatToClient(JSON.parse(message));
                }
                catch (e) {
                    this.logger.warn('[SSE] Chat envelope parse error', e);
                }
            }
        });
    }
    subscribeToNotifications(userId) {
        let subject = this.sseConnections.get(userId);
        if (!subject) {
            subject = new rxjs_1.Subject();
            this.sseConnections.set(userId, subject);
        }
        return subject.asObservable();
    }
    removeConnection(userId) {
        const subject = this.sseConnections.get(userId);
        if (subject) {
            subject.complete();
            this.sseConnections.delete(userId);
            this.logger.debug(`[SSE] Đã đóng kết nối của User: ${userId}`);
        }
    }
    dispatchToClient(notification) {
        const receiverIdStr = notification.receiverId.toString();
        const subject = this.sseConnections.get(receiverIdStr);
        if (subject) {
            subject.next({
                type: notification.type,
                data: notification,
            });
        }
    }
    dispatchChatToClient(envelope) {
        const receiverIdStr = String(envelope.receiverId);
        const subject = this.sseConnections.get(receiverIdStr);
        if (!subject)
            return;
        subject.next({
            type: 'CHAT_MESSAGE',
            data: { threadId: envelope.threadId, message: envelope.message },
        });
    }
    publishChatFanout(payload) {
        return this.redisPublisher.publish(this.CHAT_CHANNEL, JSON.stringify(payload));
    }
    async createAndDispatch(input) {
        const notification = await this.notificationsRepo.createDocument({
            receiverId: input.receiverId,
            senderId: input.senderId || null,
            type: input.type,
            title: input.title,
            message: input.message,
            payload: input.payload || {},
            isRead: false,
        });
        await this.redisPublisher.publish(this.REDIS_CHANNEL, JSON.stringify(notification));
        return notification;
    }
    async getUserNotifications(userId, page, limit) {
        const skip = (page - 1) * limit;
        const filter = { receiverId: userId };
        const [items, total, unreadCount] = await Promise.all([
            this.notificationsRepo.modelInstance
                .find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean()
                .exec(),
            this.notificationsRepo.modelInstance.countDocuments(filter).exec(),
            this.notificationsRepo.countUnread(userId),
        ]);
        return {
            items,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                unreadCount,
            },
        };
    }
    async markAsRead(userId, notificationId) {
        const updated = await this.notificationsRepo.updateByIdSafe(notificationId, { $set: { isRead: true } }, { filter: { receiverId: userId } });
        return updated;
    }
    async markAllAsRead(userId) {
        await this.notificationsRepo.markAllAsReadForUser(userId);
        return { success: true };
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)('REDIS_CLIENT')),
    __metadata("design:paramtypes", [notifications_repository_1.NotificationsRepository,
        config_1.ConfigService,
        ioredis_1.default])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map