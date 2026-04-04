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
exports.LearningTrackingController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const learning_tracking_dto_1 = require("../dto/learning-tracking.dto");
const learning_tracking_service_1 = require("../services/learning-tracking.service");
let LearningTrackingController = class LearningTrackingController {
    trackingService;
    constructor(trackingService) {
        this.trackingService = trackingService;
    }
    async syncHeartbeat(dto, userId) {
        const payload = {
            userId,
            courseId: dto.courseId,
            lessonId: dto.lessonId,
            delta: dto.delta,
            lastPosition: dto.lastPosition,
            isEnded: dto.isEnded,
        };
        await this.trackingService.recordHeartbeat(payload);
        return { message: 'ACK' };
    }
};
exports.LearningTrackingController = LearningTrackingController;
__decorate([
    (0, common_1.Post)('heartbeat'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [learning_tracking_dto_1.SyncHeartbeatDto, String]),
    __metadata("design:returntype", Promise)
], LearningTrackingController.prototype, "syncHeartbeat", null);
exports.LearningTrackingController = LearningTrackingController = __decorate([
    (0, common_1.Controller)('learning'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [learning_tracking_service_1.LearningTrackingService])
], LearningTrackingController);
//# sourceMappingURL=learning-tracking.controller.js.map