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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagingController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const messaging_service_1 = require("./messaging.service");
const send_chat_message_dto_1 = require("./dto/send-chat-message.dto");
let MessagingController = class MessagingController {
    messagingService;
    constructor(messagingService) {
        this.messagingService = messagingService;
    }
    listThreads(userId) {
        return this.messagingService.listThreads(userId);
    }
    unreadCount(userId) {
        return this.messagingService.countUnreadThreads(userId);
    }
    shareableCourses(userId) {
        return this.messagingService.listShareableCourses(userId);
    }
    openThread(userId, dto) {
        return this.messagingService.openOrGetThread(userId, dto.peerUserId);
    }
    markRead(userId, threadId) {
        return this.messagingService.markThreadRead(threadId, userId);
    }
    listMessages(userId, threadId, page, limit) {
        return this.messagingService.listMessages(threadId, userId, Math.max(1, Number(page) || 1), Math.min(100, Math.max(1, Number(limit) || 40)));
    }
    sendMessage(userId, threadId, dto) {
        return this.messagingService.sendMessage(threadId, userId, dto);
    }
};
exports.MessagingController = MessagingController;
__decorate([
    (0, common_1.Get)('threads'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MessagingController.prototype, "listThreads", null);
__decorate([
    (0, common_1.Get)('threads/unread-count'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MessagingController.prototype, "unreadCount", null);
__decorate([
    (0, common_1.Get)('shareable-courses'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MessagingController.prototype, "shareableCourses", null);
__decorate([
    (0, common_1.Post)('threads/open'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, send_chat_message_dto_1.OpenThreadDto]),
    __metadata("design:returntype", void 0)
], MessagingController.prototype, "openThread", null);
__decorate([
    (0, common_1.Post)('threads/:threadId/read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(1, (0, common_1.Param)('threadId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], MessagingController.prototype, "markRead", null);
__decorate([
    (0, common_1.Get)('threads/:threadId/messages'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(1, (0, common_1.Param)('threadId')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], MessagingController.prototype, "listMessages", null);
__decorate([
    (0, common_1.Post)('threads/:threadId/messages'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(1, (0, common_1.Param)('threadId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, send_chat_message_dto_1.SendChatMessageDto]),
    __metadata("design:returntype", void 0)
], MessagingController.prototype, "sendMessage", null);
exports.MessagingController = MessagingController = __decorate([
    (0, common_1.Controller)('messaging'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [messaging_service_1.MessagingService])
], MessagingController);
//# sourceMappingURL=messaging.controller.js.map