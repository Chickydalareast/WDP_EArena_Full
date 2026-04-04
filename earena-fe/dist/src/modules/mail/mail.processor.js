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
var MailProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const mailer_1 = require("@nestjs-modules/mailer");
const config_1 = require("@nestjs/config");
let MailProcessor = MailProcessor_1 = class MailProcessor extends bullmq_1.WorkerHost {
    mailerService;
    configService;
    logger = new common_1.Logger(MailProcessor_1.name);
    fromEmail;
    logoUrl;
    constructor(mailerService, configService) {
        super();
        this.mailerService = mailerService;
        this.configService = configService;
        this.fromEmail = this.configService.get('MAIL_FROM', 'noreply@earena.vn');
        this.logoUrl =
            this.configService.get('APP_URL', '') + '/assets/images/logo.png';
    }
    async process(job) {
        switch (job.name) {
            case 'send_otp':
                return this.handleSendOtp(job);
            case 'course_approval':
                return this.handleCourseApproval(job);
            case 'course_rejection':
                return this.handleCourseRejection(job);
            case 'withdrawal-approval':
                return this.handleWithdrawalApproval(job);
            case 'withdrawal-rejection':
                return this.handleWithdrawalRejection(job);
            case 'teacher_verification_approval':
                return this.handleTeacherApproval(job);
            case 'teacher_verification_rejection':
                return this.handleTeacherRejection(job);
            default:
                this.logger.warn(`[Queue] Không tìm thấy handler cho job: ${job.name}`);
        }
    }
    async handleSendOtp(job) {
        this.logger.log(`[Queue] Start sending OTP to ${job.data.email}...`);
        try {
            await this.mailerService.sendMail({
                to: job.data.email,
                subject: 'EArena - Verification Code',
                template: './otp',
                context: {
                    name: job.data.name,
                    otp: job.data.otp,
                },
            });
            this.logger.log(`[Queue] OTP sent successfully to ${job.data.email}`);
        }
        catch (error) {
            this.logger.error(`[Queue] Failed to send OTP: ${error.message}`, error.stack);
            throw error;
        }
    }
    async handleCourseApproval(job) {
        this.logger.log(`[Queue] Start sending Course Approval to ${job.data.email}...`);
        try {
            await this.mailerService.sendMail({
                to: job.data.email,
                subject: 'EArena - Khóa học của bạn đã được xuất bản!',
                template: './course-approval',
                context: {
                    name: job.data.name,
                    courseTitle: job.data.courseTitle,
                },
            });
            this.logger.log(`[Queue] Approval email sent successfully to ${job.data.email}`);
        }
        catch (error) {
            this.logger.error(`[Queue] Failed to send approval email: ${error.message}`, error.stack);
            throw error;
        }
    }
    async handleCourseRejection(job) {
        this.logger.log(`[Queue] Start sending Course Rejection to ${job.data.email}...`);
        try {
            await this.mailerService.sendMail({
                to: job.data.email,
                subject: 'EArena - Yêu cầu chỉnh sửa khóa học',
                template: './course-rejection',
                context: {
                    name: job.data.name,
                    courseTitle: job.data.courseTitle,
                    reason: job.data.reason,
                },
            });
            this.logger.log(`[Queue] Rejection email sent successfully to ${job.data.email}`);
        }
        catch (error) {
            this.logger.error(`[Queue] Failed to send rejection email: ${error.message}`, error.stack);
            throw error;
        }
    }
    async handleWithdrawalApproval(job) {
        this.logger.log(`[Worker] Processing Withdrawal Approval mail to: ${job.data.to}`);
        try {
            await this.mailerService.sendMail({
                to: job.data.to,
                from: `E-ARENA Financial <${this.fromEmail}>`,
                subject: ' Thông báo: Yêu cầu rút tiền của bạn đã được hoàn tất',
                template: './withdrawal-approval',
                context: {
                    ...job.data,
                    logoUrl: this.logoUrl,
                    year: new Date().getFullYear(),
                },
            });
            this.logger.log(`[Worker] Sent Withdrawal Approval mail to: ${job.data.to} (TX: ${job.data.transactionId})`);
        }
        catch (error) {
            this.logger.error(`[Worker] Failed to send Withdrawal Approval mail to: ${job.data.to} - ${error.message}`);
            throw error;
        }
    }
    async handleWithdrawalRejection(job) {
        this.logger.log(`[Worker] Processing Withdrawal Rejection mail to: ${job.data.to}`);
        try {
            await this.mailerService.sendMail({
                to: job.data.to,
                from: `E-ARENA Financial <${this.fromEmail}>`,
                subject: 'Thông báo: Yêu cầu rút tiền của bạn bị từ chối đối soát',
                template: './withdrawal-rejection',
                context: {
                    ...job.data,
                    logoUrl: this.logoUrl,
                    year: new Date().getFullYear(),
                },
            });
            this.logger.log(`[Worker] Sent Withdrawal Rejection mail to: ${job.data.to} (TX: ${job.data.transactionId})`);
        }
        catch (error) {
            this.logger.error(`[Worker] Failed to send Withdrawal Rejection mail to: ${job.data.to} - ${error.message}`);
            throw error;
        }
    }
    async handleTeacherApproval(job) {
        this.logger.log(`[Queue] Start sending Teacher Approval to ${job.data.email}...`);
        try {
            await this.mailerService.sendMail({
                to: job.data.email,
                subject: 'EArena - Tài khoản giáo viên đã được xác minh!',
                template: './teacher-approval',
                context: {
                    name: job.data.name,
                    note: job.data.note,
                    year: new Date().getFullYear(),
                },
            });
            this.logger.log(`[Queue] Teacher approval email sent successfully to ${job.data.email}`);
        }
        catch (error) {
            this.logger.error(`[Queue] Failed to send teacher approval email: ${error.message}`, error.stack);
            throw error;
        }
    }
    async handleTeacherRejection(job) {
        this.logger.log(`[Queue] Start sending Teacher Rejection to ${job.data.email}...`);
        try {
            await this.mailerService.sendMail({
                to: job.data.email,
                subject: 'EArena - Hồ sơ giáo viên chưa được xác minh',
                template: './teacher-rejection',
                context: {
                    name: job.data.name,
                    reason: job.data.reason,
                    year: new Date().getFullYear(),
                },
            });
            this.logger.log(`[Queue] Teacher rejection email sent successfully to ${job.data.email}`);
        }
        catch (error) {
            this.logger.error(`[Queue] Failed to send teacher rejection email: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.MailProcessor = MailProcessor;
exports.MailProcessor = MailProcessor = MailProcessor_1 = __decorate([
    (0, bullmq_1.Processor)('mail_queue'),
    __metadata("design:paramtypes", [mailer_1.MailerService,
        config_1.ConfigService])
], MailProcessor);
//# sourceMappingURL=mail.processor.js.map