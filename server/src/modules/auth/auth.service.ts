import { Injectable, UnauthorizedException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

import { UsersService } from '../users/users.service';
import { TokenRepository } from './token.repository';
import { AuthCacheRepository } from './auth.cache.repository';
import { MailService } from '../mail/mail.service';
import { UserDocument } from '../users/schemas/user.schema';

// ===========================================================================
// ĐỊNH NGHĨA DOMAIN PAYLOADS (Độc lập 100% với HTTP Controller)
// ===========================================================================
export type AuthOtpType = 'REGISTER' | 'FORGOT_PASSWORD';

export type LoginPayload = { email: string; password: string };
export type SendOtpPayload = { email: string; type: AuthOtpType };
export type RegisterPayload = { email: string; fullName: string; password: string; ticket: string };
export type ResetPasswordPayload = { email: string; newPassword: string; ticket: string };
export type ChangePasswordPayload = { oldPassword: string; newPassword: string };

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly tokenRepository: TokenRepository,
    private readonly authCacheRepo: AuthCacheRepository,
    private readonly mailService: MailService,
  ) { }

  private async generateTokenPair(user: any) {
    const payload = { userId: user._id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = uuidv4();
    const refreshExpireDays = this.configService.get<number>('JWT_REFRESH_EXPIRATION_DAYS') || 7;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + refreshExpireDays);
    await this.tokenRepository.saveToken(refreshToken, user._id, expiresAt);

    const userResponse = {
      id: user._id.toString(),
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    };
    return { accessToken, refreshToken, user: userResponse };
  }

  private generateSecureOtp(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  async login(payload: LoginPayload) {
    const user = await this.usersService.findByEmailForAuth(payload.email);
    if (!user || !user.password) throw new UnauthorizedException('Invalid email or password');

    const isPasswordValid = await bcrypt.compare(payload.password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Invalid email or password');

    return this.generateTokenPair(user);
  }

  async refreshTokens(refreshToken: string) {
    const tokenDoc = await this.tokenRepository.findByToken(refreshToken);
    if (!tokenDoc) throw new UnauthorizedException('Invalid or expired refresh token');

    await this.tokenRepository.deleteToken(refreshToken);
    if (tokenDoc.expiresAt < new Date()) throw new UnauthorizedException('Refresh token expired');

    const user = await this.usersService.findById(tokenDoc.userId.toString());
    if (!user) throw new UnauthorizedException('User not found');

    return this.generateTokenPair(user);
  }

  async logout(userId: string, accessToken: string, refreshToken: string) {
    if (refreshToken) await this.tokenRepository.deleteToken(refreshToken);
    if (accessToken) {
      try {
        const decoded = this.jwtService.decode(accessToken) as any;
        if (decoded && decoded.exp) {
          const now = Math.floor(Date.now() / 1000);
          const ttl = decoded.exp - now;
          if (ttl > 0) await this.authCacheRepo.addTokenToBlacklist(accessToken, ttl);
        }
      } catch (error) { }
    }
  }

  async sendOtp(payload: SendOtpPayload) {
    const { email, type } = payload;
    const existingUser = await this.usersService.findByEmail(email);

    if (type === 'REGISTER' && existingUser) throw new BadRequestException('Email này đã được đăng ký.');
    if (type === 'FORGOT_PASSWORD' && !existingUser) throw new BadRequestException('Email không tồn tại.');

    const otp = this.generateSecureOtp();
    await this.authCacheRepo.setOtpWithCooldown(email, otp);

    const name = existingUser ? existingUser.fullName : 'Học viên';
    const isQueued = await this.mailService.sendUserOtp(email, name, otp);

    if (!isQueued) throw new InternalServerErrorException('Hệ thống mail đang bận. Vui lòng thử lại sau.');
    return { message: 'Mã OTP đã được gửi đến email của bạn.' };
  }

  async verifyOtp(email: string, otp: string, type: AuthOtpType) {
    await this.authCacheRepo.verifyOtpAttempt(email, otp);
    const ticket = await this.authCacheRepo.createAuthTicket(email, type);
    return { success: true, message: 'Xác thực OTP thành công.', ticket };
  }

  async register(payload: RegisterPayload) {
    const { email, fullName, password, ticket } = payload;
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) throw new BadRequestException('Email đã được đăng ký.');

    await this.authCacheRepo.consumeAuthTicket(email, 'REGISTER', ticket);

    const newUser = await this.usersService.create({ email, fullName, password, role: 'STUDENT' });
    return this.generateTokenPair(newUser);
  }

  async resetPassword(payload: ResetPasswordPayload) {
    const { email, newPassword, ticket } = payload;
    const user = await this.usersService.findByEmail(email) as UserDocument;
    if (!user) throw new BadRequestException('Tài khoản không tồn tại.');

    await this.authCacheRepo.consumeAuthTicket(email, 'FORGOT_PASSWORD', ticket);

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await this.usersService.updatePassword(user._id.toString(), hashedPassword);
    await this.tokenRepository.deleteAllTokensForUser(user._id.toString());

    return { message: 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.' };
  }

  async changePassword(userId: string, payload: ChangePasswordPayload) {
    const user = await this.usersService.findByIdForAuth(userId);
    if (!user || !user.password) throw new UnauthorizedException('Phiên đăng nhập không hợp lệ.');

    const isPasswordMatch = await bcrypt.compare(payload.oldPassword, user.password);
    if (!isPasswordMatch) throw new BadRequestException('Mật khẩu hiện tại không chính xác.');

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(payload.newPassword, salt);
    await this.usersService.updatePassword(userId, hashedPassword);
    await this.tokenRepository.deleteAllTokensForUser(userId);

    return { message: 'Đổi mật khẩu thành công.' };
  }
}