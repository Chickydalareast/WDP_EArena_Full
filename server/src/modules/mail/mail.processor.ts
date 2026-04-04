import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import {
  WithdrawalApprovalMailPayload,
  WithdrawalRejectionMailPayload,
} from './interfaces/mail-withdrawal.interface';

export interface SendOtpPayload {
  email: string;
  name: string;
  otp: string;
}

export interface CourseApprovalPayload {
  email: string;
  name: string;
  courseTitle: string;
  status: string;
}

export interface CourseRejectionPayload {
  email: string;
  name: string;
  courseTitle: string;
  status: string;
  reason: string;
}

export interface TeacherApprovalPayload {
  email: string;
  name: string;
  note?: string;
}

export interface TeacherRejectionPayload {
  email: string;
  name: string;
  reason?: string;
}

type MailJobPayload =
  | SendOtpPayload
  | CourseApprovalPayload
  | CourseRejectionPayload
  | WithdrawalApprovalMailPayload
  | WithdrawalRejectionMailPayload
  | TeacherApprovalPayload
  | TeacherRejectionPayload;

@Processor('mail_queue')
export class MailProcessor extends WorkerHost {
  private readonly logger = new Logger(MailProcessor.name);
  private readonly fromEmail: string;
  private readonly logoUrl: string;

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {
    super();
    this.fromEmail = this.configService.get<string>(
      'MAIL_FROM',
      'noreply@earena.vn',
    );
    this.logoUrl =
      this.configService.get<string>('APP_URL', '') + '/assets/images/logo.png';
  }

  async process(job: Job<MailJobPayload>): Promise<any> {
    if (this.configService.get<string>('SKIP_MAIL_QUEUE') === 'true') {
      this.logger.log(`[Queue] SKIP_MAIL_QUEUE=true — skipping job ${job.name}`);
      return;
    }
    switch (job.name) {
      case 'send_otp':
        return this.handleSendOtp(job as Job<SendOtpPayload>);

      case 'course_approval':
        return this.handleCourseApproval(job as Job<CourseApprovalPayload>);

      case 'course_rejection':
        return this.handleCourseRejection(job as Job<CourseRejectionPayload>);

      case 'withdrawal-approval':
        return this.handleWithdrawalApproval(
          job as Job<WithdrawalApprovalMailPayload>,
        );

      case 'withdrawal-rejection':
        return this.handleWithdrawalRejection(
          job as Job<WithdrawalRejectionMailPayload>,
        );

      case 'teacher_verification_approval':
        return this.handleTeacherApproval(job as Job<TeacherApprovalPayload>);

      case 'teacher_verification_rejection':
        return this.handleTeacherRejection(job as Job<TeacherRejectionPayload>);

      default:
        this.logger.warn(`[Queue] Không tìm thấy handler cho job: ${job.name}`);
    }
  }

  private async handleSendOtp(job: Job<SendOtpPayload>) {
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
    } catch (error: any) {
      this.logger.error(
        `[Queue] Failed to send OTP: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  private async handleCourseApproval(job: Job<CourseApprovalPayload>) {
    this.logger.log(
      `[Queue] Start sending Course Approval to ${job.data.email}...`,
    );
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
      this.logger.log(
        `[Queue] Approval email sent successfully to ${job.data.email}`,
      );
    } catch (error: any) {
      this.logger.error(
        `[Queue] Failed to send approval email: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  private async handleCourseRejection(job: Job<CourseRejectionPayload>) {
    this.logger.log(
      `[Queue] Start sending Course Rejection to ${job.data.email}...`,
    );
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
      this.logger.log(
        `[Queue] Rejection email sent successfully to ${job.data.email}`,
      );
    } catch (error: any) {
      this.logger.error(
        `[Queue] Failed to send rejection email: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  private async handleWithdrawalApproval(
    job: Job<WithdrawalApprovalMailPayload>,
  ) {
    this.logger.log(
      `[Worker] Processing Withdrawal Approval mail to: ${job.data.to}`,
    );
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
      this.logger.log(
        `[Worker] Sent Withdrawal Approval mail to: ${job.data.to} (TX: ${job.data.transactionId})`,
      );
    } catch (error: any) {
      this.logger.error(
        `[Worker] Failed to send Withdrawal Approval mail to: ${job.data.to} - ${error.message}`,
      );
      throw error;
    }
  }

  private async handleWithdrawalRejection(
    job: Job<WithdrawalRejectionMailPayload>,
  ) {
    this.logger.log(
      `[Worker] Processing Withdrawal Rejection mail to: ${job.data.to}`,
    );
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
      this.logger.log(
        `[Worker] Sent Withdrawal Rejection mail to: ${job.data.to} (TX: ${job.data.transactionId})`,
      );
    } catch (error: any) {
      this.logger.error(
        `[Worker] Failed to send Withdrawal Rejection mail to: ${job.data.to} - ${error.message}`,
      );
      throw error;
    }
  }

  private async handleTeacherApproval(job: Job<TeacherApprovalPayload>) {
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
    } catch (error: any) {
      this.logger.error(`[Queue] Failed to send teacher approval email: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async handleTeacherRejection(job: Job<TeacherRejectionPayload>) {
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
    } catch (error: any) {
      this.logger.error(`[Queue] Failed to send teacher rejection email: ${error.message}`, error.stack);
      throw error;
    }
  }
}