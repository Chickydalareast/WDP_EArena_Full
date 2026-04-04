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
var QuestionNotificationListener_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionNotificationListener = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const notifications_service_1 = require("../notifications.service");
const notification_event_constant_1 = require("../constants/notification-event.constant");
let QuestionNotificationListener = QuestionNotificationListener_1 = class QuestionNotificationListener {
    notificationsService;
    logger = new common_1.Logger(QuestionNotificationListener_1.name);
    constructor(notificationsService) {
        this.notificationsService = notificationsService;
    }
    async handleAutoTagBatchCompleted(payload) {
        try {
            await this.notificationsService.createAndDispatch({
                receiverId: payload.teacherId,
                type: notification_event_constant_1.NotificationType.SYSTEM,
                title: 'Tiến độ AI Phân loại',
                message: `Đã phân tích xong lô ${payload.batchNum}/${payload.totalBatches} câu hỏi. Dữ liệu đã được cập nhật.`,
                payload: {
                    metadata: {
                        event: 'AUTO_TAG_BATCH_COMPLETED',
                        batchNum: payload.batchNum,
                        totalBatches: payload.totalBatches,
                        processedQuestions: payload.processedQuestions,
                    },
                },
            });
            this.logger.debug(`[SSE Fired] Đã bắn thông báo cập nhật UI cho lô ${payload.batchNum}/${payload.totalBatches} tới Teacher ${payload.teacherId}`);
        }
        catch (error) {
            this.logger.error(`[Listener Error] AUTO_TAG_BATCH: ${error.message}`, error.stack);
        }
    }
};
exports.QuestionNotificationListener = QuestionNotificationListener;
__decorate([
    (0, event_emitter_1.OnEvent)(notification_event_constant_1.NotificationEventPattern.QUESTION_AUTO_TAG_BATCH_COMPLETED, {
        async: true,
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], QuestionNotificationListener.prototype, "handleAutoTagBatchCompleted", null);
exports.QuestionNotificationListener = QuestionNotificationListener = QuestionNotificationListener_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [notifications_service_1.NotificationsService])
], QuestionNotificationListener);
//# sourceMappingURL=question-notification.listener.js.map