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
var MailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
let MailService = MailService_1 = class MailService {
    mailQueue;
    logger = new common_1.Logger(MailService_1.name);
    constructor(mailQueue) {
        this.mailQueue = mailQueue;
    }
    async sendUserOtp(email, name, otp) {
        try {
            await this.mailQueue.add('send_otp', { email, name, otp }, {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 1000,
                },
                removeOnComplete: true,
                removeOnFail: false,
            });
            return true;
        }
        catch (error) {
            this.logger.error(`Error adding mail job to queue: ${error.message}`);
            return false;
        }
    }
    async sendCourseApproval(email, name, courseTitle) {
        try {
            await this.mailQueue.add('course_approval', { email, name, courseTitle, status: 'APPROVED' }, {
                attempts: 3,
                backoff: { type: 'exponential', delay: 1000 },
                removeOnComplete: true,
            });
            return true;
        }
        catch (error) {
            this.logger.error(`[MailQueue Error] Không thể gửi mail duyệt khóa học cho ${email}: ${error.message}`);
            return false;
        }
    }
    async sendCourseRejection(email, name, courseTitle, reason) {
        try {
            await this.mailQueue.add('course_rejection', { email, name, courseTitle, status: 'REJECTED', reason }, {
                attempts: 3,
                backoff: { type: 'exponential', delay: 1000 },
                removeOnComplete: true,
            });
            return true;
        }
        catch (error) {
            this.logger.error(`[MailQueue Error] Không thể gửi mail từ chối khóa học cho ${email}: ${error.message}`);
            return false;
        }
    }
    async addWithdrawalApprovalJob(payload) {
        try {
            await this.mailQueue.add('withdrawal-approval', payload, {
                attempts: 3,
                backoff: 5000,
                removeOnComplete: true,
            });
            this.logger.log(`[Queue] Added Withdrawal Approval mail job to: ${payload.to}`);
        }
        catch (error) {
            this.logger.error(`[Queue] Error adding Withdrawal Approval job: ${error.message}`);
        }
    }
    async addWithdrawalRejectionJob(payload) {
        try {
            await this.mailQueue.add('withdrawal-rejection', payload, {
                attempts: 3,
                backoff: 5000,
                removeOnComplete: true,
            });
            this.logger.log(`[Queue] Added Withdrawal Rejection mail job to: ${payload.to}`);
        }
        catch (error) {
            this.logger.error(`[Queue] Error adding Withdrawal Rejection job: ${error.message}`);
        }
    }
    async sendTeacherVerificationApproval(email, name, note) {
        try {
            await this.mailQueue.add('teacher_verification_approval', { email, name, note }, { attempts: 3, backoff: { type: 'exponential', delay: 1000 }, removeOnComplete: true });
            return true;
        }
        catch (error) {
            this.logger.error(`[MailQueue Error] Không thể gửi mail duyệt giáo viên cho ${email}: ${error.message}`);
            return false;
        }
    }
    async sendTeacherVerificationRejection(email, name, reason) {
        try {
            await this.mailQueue.add('teacher_verification_rejection', { email, name, reason }, { attempts: 3, backoff: { type: 'exponential', delay: 1000 }, removeOnComplete: true });
            return true;
        }
        catch (error) {
            this.logger.error(`[MailQueue Error] Không thể gửi mail từ chối giáo viên cho ${email}: ${error.message}`);
            return false;
        }
    }
};
exports.MailService = MailService;
exports.MailService = MailService = MailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, bullmq_1.InjectQueue)('mail_queue')),
    __metadata("design:paramtypes", [bullmq_2.Queue])
], MailService);
//# sourceMappingURL=mail.service.js.map