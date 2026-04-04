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
var ExamGradingListener_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExamGradingListener = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const exam_event_constant_1 = require("../constants/exam-event.constant");
let ExamGradingListener = ExamGradingListener_1 = class ExamGradingListener {
    gradingQueue;
    logger = new common_1.Logger(ExamGradingListener_1.name);
    constructor(gradingQueue) {
        this.gradingQueue = gradingQueue;
    }
    async handleExamSubmittedEvent(payload) {
        this.logger.log(`[Listener] Bắt được sự kiện nộp bài ${payload.submissionId}. Đang đẩy vào Queue...`);
        try {
            await this.gradingQueue.add('grade-submission', {
                submissionId: payload.submissionId,
            }, {
                removeOnComplete: true,
                attempts: 3,
                backoff: { type: 'exponential', delay: 1000 },
            });
        }
        catch (error) {
            this.logger.error(`[Listener] Lỗi khi đẩy bài thi ${payload.submissionId} vào Queue: ${error.message}`, error.stack);
        }
    }
};
exports.ExamGradingListener = ExamGradingListener;
__decorate([
    (0, event_emitter_1.OnEvent)(exam_event_constant_1.ExamEventPattern.EXAM_SUBMITTED, { async: true }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ExamGradingListener.prototype, "handleExamSubmittedEvent", null);
exports.ExamGradingListener = ExamGradingListener = ExamGradingListener_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, bullmq_1.InjectQueue)('exam-grading')),
    __metadata("design:paramtypes", [bullmq_2.Queue])
], ExamGradingListener);
//# sourceMappingURL=exam-grading.listener.js.map