import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  WithdrawalApprovalMailPayload,
  WithdrawalRejectionMailPayload,
} from './interfaces/mail-withdrawal.interface';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(@InjectQueue('mail_queue') private mailQueue: Queue) {}

  async sendUserOtp(
    email: string,
    name: string,
    otp: string,
  ): Promise<boolean> {
    try {
      await this.mailQueue.add(
        'send_otp',
        { email, name, otp },
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
          removeOnComplete: true,
          removeOnFail: false,
        },
      );
      return true;
    } catch (error: any) {
      this.logger.error(`Error adding mail job to queue: ${error.message}`);
      return false;
    }
  }

  async sendCourseApproval(
    email: string,
    name: string,
    courseTitle: string,
  ): Promise<boolean> {
    try {
      await this.mailQueue.add(
        'course_approval',
        { email, name, courseTitle, status: 'APPROVED' },
        {
          attempts: 3,
          backoff: { type: 'exponential', delay: 1000 },
          removeOnComplete: true,
        },
      );
      return true;
    } catch (error: any) {
      this.logger.error(
        `[MailQueue Error] Không thể gửi mail duyệt khóa học cho ${email}: ${error.message}`,
      );
      return false;
    }
  }

  async sendCourseRejection(
    email: string,
    name: string,
    courseTitle: string,
    reason: string,
  ): Promise<boolean> {
    try {
      await this.mailQueue.add(
        'course_rejection',
        { email, name, courseTitle, status: 'REJECTED', reason },
        {
          attempts: 3,
          backoff: { type: 'exponential', delay: 1000 },
          removeOnComplete: true,
        },
      );
      return true;
    } catch (error: any) {
      this.logger.error(
        `[MailQueue Error] Không thể gửi mail từ chối khóa học cho ${email}: ${error.message}`,
      );
      return false;
    }
  }

  async addWithdrawalApprovalJob(payload: WithdrawalApprovalMailPayload) {
    try {
      await this.mailQueue.add('withdrawal-approval', payload, {
        attempts: 3,
        backoff: 5000,
        removeOnComplete: true,
      });
      this.logger.log(
        `[Queue] Added Withdrawal Approval mail job to: ${payload.to}`,
      );
    } catch (error) {
      this.logger.error(
        `[Queue] Error adding Withdrawal Approval job: ${error.message}`,
      );
    }
  }

  async addWithdrawalRejectionJob(payload: WithdrawalRejectionMailPayload) {
    try {
      await this.mailQueue.add('withdrawal-rejection', payload, {
        attempts: 3,
        backoff: 5000,
        removeOnComplete: true,
      });
      this.logger.log(
        `[Queue] Added Withdrawal Rejection mail job to: ${payload.to}`,
      );
    } catch (error) {
      this.logger.error(
        `[Queue] Error adding Withdrawal Rejection job: ${error.message}`,
      );
    }
  }

  async sendTeacherVerificationApproval(email: string, name: string, note?: string): Promise<boolean> {
    try {
      await this.mailQueue.add(
        'teacher_verification_approval',
        { email, name, note },
        { attempts: 3, backoff: { type: 'exponential', delay: 1000 }, removeOnComplete: true }
      );
      return true;
    } catch (error: any) {
      this.logger.error(`[MailQueue Error] Không thể gửi mail duyệt giáo viên cho ${email}: ${error.message}`);
      return false;
    }
  }

  async sendTeacherVerificationRejection(email: string, name: string, reason?: string): Promise<boolean> {
    try {
      await this.mailQueue.add(
        'teacher_verification_rejection',
        { email, name, reason },
        { attempts: 3, backoff: { type: 'exponential', delay: 1000 }, removeOnComplete: true }
      );
      return true;
    } catch (error: any) {
      this.logger.error(`[MailQueue Error] Không thể gửi mail từ chối giáo viên cho ${email}: ${error.message}`);
      return false;
    }
  }
}