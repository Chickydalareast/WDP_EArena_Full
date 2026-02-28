import { Injectable, BadRequestException } from '@nestjs/common';
import { RedisService } from '../../common/redis/redis.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthCacheRepository {
  private readonly PREFIX = 'earena:auth';
  private readonly OTP_TTL = 300; 
  private readonly OTP_COOLDOWN = 60; 

  constructor(private readonly redisService: RedisService) {}

  async addTokenToBlacklist(token: string, ttlSeconds: number): Promise<void> {
    if (ttlSeconds > 0) {
      const key = `${this.PREFIX}:bl:${token}`;
      await this.redisService.set(key, 'revoked', ttlSeconds);
    }
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    const key = `${this.PREFIX}:bl:${token}`;
    const result = await this.redisService.get(key);
    return result === 'revoked';
  }

  async setOtpWithCooldown(email: string, otp: string): Promise<void> {
    const cdKey = `${this.PREFIX}:otp:cd:${email}`;
    const valKey = `${this.PREFIX}:otp:val:${email}`;
    const tryKey = `${this.PREFIX}:otp:try:${email}`;

    const isAllowed = await this.redisService.setNx(cdKey, 'lock', this.OTP_COOLDOWN);
    if (!isAllowed) {
      throw new BadRequestException(`Vui lòng đợi ${this.OTP_COOLDOWN} giây trước khi yêu cầu mã mới.`);
    }

    const pipeline = this.redisService.getPipeline();
    pipeline.set(valKey, otp, 'EX', this.OTP_TTL);
    pipeline.del(tryKey);
    await pipeline.exec();
  }

  async verifyOtpAttempt(email: string, inputOtp: string, maxAttempts: number = 5): Promise<void> {
    const valKey = `${this.PREFIX}:otp:val:${email}`;
    const tryKey = `${this.PREFIX}:otp:try:${email}`;

    const attempts = await this.redisService.incr(tryKey);
    if (attempts === 1) {
      await this.redisService.expire(tryKey, this.OTP_TTL);
    }

    if (attempts > maxAttempts) {
      await this.redisService.del(valKey);
      throw new BadRequestException('Nhập sai quá nhiều lần. Vui lòng yêu cầu mã OTP mới.');
    }

    const storedOtp = await this.redisService.get(valKey);
    if (!storedOtp) {
      throw new BadRequestException('Mã OTP đã hết hạn hoặc không tồn tại.');
    }

    if (storedOtp !== inputOtp) {
      throw new BadRequestException(`Mã OTP không hợp lệ. Bạn còn ${maxAttempts - attempts} lần thử.`);
    }

    await this.redisService.del(valKey, tryKey);
  }

  async createAuthTicket(email: string, type: string): Promise<string> {
    // Tạo 1 chuỗi token ngẫu nhiên cực mạnh (64 ký tự hex)
    const ticket = crypto.randomBytes(32).toString('hex');
    const key = `${this.PREFIX}:ticket:${type}:${email}`;
    
    // Lưu ticket vào Redis với TTL 15 phút (900s)
    await this.redisService.set(key, ticket, 900);
    return ticket;
  }

  /**
   * Kiểm tra và Xóa vé ngay lập tức (Chỉ được dùng 1 lần)
   */
  async consumeAuthTicket(email: string, type: string, inputTicket: string): Promise<void> {
    const key = `${this.PREFIX}:ticket:${type}:${email}`;
    
    // Lấy vé từ Redis
    const storedTicket = await this.redisService.get(key);
    
    if (!storedTicket || storedTicket !== inputTicket) {
      throw new BadRequestException('Phiên xác thực không hợp lệ hoặc đã hết hạn.');
    }

    // Nếu khớp -> Cắt vé (Burn after reading) để ngăn tấn công Replay Attack
    await this.redisService.del(key);
  }
}