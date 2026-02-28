import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { MailerService } from '@nestjs-modules/mailer';

@Processor('mail_queue')
export class MailProcessor {
  private readonly logger = new Logger(MailProcessor.name);

  constructor(private readonly mailerService: MailerService) {}

  @Process('send_otp')
  async handleSendOtp(job: Job<{ email: string; name: string; otp: string }>) {
    this.logger.log(`[Queue] Start sending OTP to ${job.data.email}...`);

    try {
      await this.mailerService.sendMail({
        to: job.data.email,
        subject: 'EArena - Verification Code',
        template: './otp', // Tự động map vào file templates/otp.hbs
        context: {
          name: job.data.name,
          otp: job.data.otp,
        },
      });
      this.logger.log(`[Queue] OTP sent successfully to ${job.data.email}`);
    } catch (error) {
      this.logger.error(`[Queue] Failed to send OTP: ${error.message}`, error.stack);
      throw error; // Ném lỗi để Bull biết job fail và tính toán retry
    }
  }
}