import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(@InjectQueue('mail_queue') private mailQueue: Queue) {}

  /**
   * Gửi OTP qua Email (Async via Redis Queue)
   * @param email Email người nhận
   * @param name Tên người nhận
   * @param otp Mã OTP
   */
  async sendUserOtp(email: string, name: string, otp: string): Promise<boolean> {
    try {
      await this.mailQueue.add(
        'send_otp', // Tên Job
        {
          email,
          name,
          otp,
        },
        {
          attempts: 3, // Retry 3 lần nếu lỗi
          backoff: {
            type: 'exponential',
            delay: 1000, // Lần 1 chờ 1s, lần 2 chờ 2s, lần 3 chờ 4s
          },
          removeOnComplete: true, // Xóa job khỏi Redis khi xong (Tiết kiệm RAM)
          removeOnFail: false, // Giữ lại job lỗi để debug
        },
      );
      return true;
    } catch (error) {
      this.logger.error(`Error adding mail job to queue: ${error.message}`);
      return false;
    }
  }
}