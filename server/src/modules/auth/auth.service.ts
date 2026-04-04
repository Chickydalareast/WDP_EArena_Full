import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
  HttpException,
  Inject,
} from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

import { UsersService } from '../users/users.service';
import { UsersRepository } from '../users/users.repository';
import { TokenRepository } from './token.repository';
import { AuthCacheRepository } from './auth.cache.repository';
import { MailService } from '../mail/mail.service';
import { TeacherVerificationStatus, UserDocument } from '../users/schemas/user.schema';
import { UserRole } from '../../common/enums/user-role.enum';
import { CLOUDINARY_PROVIDER } from '../media/interfaces/storage-provider.interface';
import type { ICloudinaryProvider } from '../media/interfaces/storage-provider.interface';
import type { Express } from 'express';

export type AuthOtpType = 'REGISTER' | 'FORGOT_PASSWORD';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  /** Teacher verification status — chỉ có khi role === TEACHER (middleware / guard phía client) */
  tvs?: string;
}

export type LoginPayload = { email: string; password: string };
export type SendOtpPayload = { email: string; type: AuthOtpType };
export type RegisterPayload = {
  email: string;
  fullName: string;
  password: string;
  ticket: string;
  role?: 'STUDENT' | 'TEACHER';
  subjectIds?: string[];
  qualifications?: { url: string; name: string }[];
};
export type ResetPasswordPayload = { email: string; newPassword: string; ticket: string };
export type ChangePasswordPayload = { oldPassword: string; newPassword: string };

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private googleClient: OAuth2Client;

  constructor(
    private readonly usersService: UsersService,
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly tokenRepository: TokenRepository,
    private readonly authCacheRepo: AuthCacheRepository,
    private readonly mailService: MailService,
    @Inject(CLOUDINARY_PROVIDER)
    private readonly cloudinaryProvider: ICloudinaryProvider,
  ) {
    this.googleClient = new OAuth2Client(this.configService.get<string>('GOOGLE_CLIENT_ID'));
  }

  private async generateTokenPair(user: UserDocument) {
    const payload: JwtPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };
    if (user.role === UserRole.TEACHER) {
      payload.tvs =
        user.teacherVerificationStatus ?? TeacherVerificationStatus.PENDING;
    }

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = crypto.randomBytes(64).toString('hex');

    const refreshExpireDays = this.configService.get<number>('JWT_REFRESH_EXPIRATION_DAYS') || 7;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + refreshExpireDays);

    await this.tokenRepository.saveToken(refreshToken, user._id, expiresAt);

    return { accessToken, refreshToken, user };
  }

  async login(payload: LoginPayload) {
    const user = await this.usersService.findByEmailForAuth(payload.email);
    if (!user || !user.password) throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');

    const isPasswordValid = await bcrypt.compare(payload.password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');

    return this.generateTokenPair(user);
  }

  async getMe(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException('Không tìm thấy thông tin người dùng');
    return user;
  }

  async refreshTokens(oldRefreshToken: string) {
    const gracePeriodTokens = await this.authCacheRepo.getRefreshGracePeriod(oldRefreshToken);
    if (gracePeriodTokens) {
      this.logger.debug(`[Race Condition Shield] Trả về token từ Grace Period cho request đến trễ.`);
      return gracePeriodTokens;
    }

    return this.tokenRepository.executeInTransaction(async () => {

      const tokenDoc = await this.tokenRepository.findByToken(oldRefreshToken);
      if (!tokenDoc) {
        throw new UnauthorizedException('Refresh token không hợp lệ hoặc đã bị thu hồi.');
      }

      if (tokenDoc.expiresAt < new Date()) {
        await this.tokenRepository.deleteByToken(oldRefreshToken);
        throw new UnauthorizedException('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.');
      }

      await this.tokenRepository.deleteByToken(oldRefreshToken);

      const user = await this.usersService.findById(tokenDoc.userId.toString());
      if (!user) {
        throw new UnauthorizedException('Không tìm thấy tài khoản liên kết với phiên này.');
      }

      const newTokens = await this.generateTokenPair(user);

      await this.authCacheRepo.setRefreshGracePeriod(oldRefreshToken, {
        accessToken: newTokens.accessToken,
        refreshToken: newTokens.refreshToken
      });

      return newTokens;
    });
  }

  async logout(userId: string, accessToken?: string, refreshToken?: string) {
    if (refreshToken) {
      await this.tokenRepository.deleteByToken(refreshToken);
    }

    if (accessToken) {
      try {
        const decoded = this.jwtService.verify(accessToken, {
          secret: this.configService.get<string>('JWT_ACCESS_SECRET')
        });

        const now = Math.floor(Date.now() / 1000);
        const ttl = decoded.exp - now;
        if (ttl > 0) {
          await this.authCacheRepo.addTokenToBlacklist(accessToken, ttl);
        }
      } catch (error) {
        this.logger.warn(`Phát hiện Access Token không hợp lệ trong quá trình Logout (User: ${userId})`);
      }
    }
  }

  private generateSecureOtp(): string {
    return crypto.randomInt(100000, 999999).toString();
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

    if (this.configService.get<string>('NODE_ENV') === 'development') {
      this.logger.warn(
        `[DEV] OTP cho ${email} (type=${type}): ${otp} — Nếu không thấy email: kiểm tra Redis/Bull, log MailProcessor và cấu hình SMTP (MAIL_*).`,
      );
    }

    return { message: 'Mã OTP đã được gửi đến email của bạn.' };
  }

  async verifyOtp(email: string, otp: string, type: AuthOtpType) {
    await this.authCacheRepo.verifyOtpAttempt(email, otp);
    const ticket = await this.authCacheRepo.createAuthTicket(email, type);
    return { success: true, message: 'Xác thực OTP thành công.', ticket };
  }

  private readonly registerQualificationFolder = 'earena/register-qualifications';

  async uploadRegistrationQualificationImage(payload: {
    email: string;
    ticket: string;
    name: string;
    file: Express.Multer.File;
  }) {
    const allowed = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
    if (!allowed.has(payload.file.mimetype)) {
      throw new BadRequestException('Chỉ chấp nhận ảnh JPEG, PNG, WebP hoặc GIF.');
    }

    await this.authCacheRepo.assertRegisterTicketValid(payload.email, payload.ticket);

    const meta = await this.cloudinaryProvider.uploadImageBuffer(
      payload.file.buffer,
      this.registerQualificationFolder,
    );

    return {
      url: meta.url,
      name: payload.name,
    };
  }

  async register(payload: RegisterPayload) {
    const { email, fullName, password, ticket, role, subjectIds, qualifications } = payload;

    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) throw new BadRequestException('Email đã được đăng ký.');

    const validSubjectIds = role === 'TEACHER' ? subjectIds : undefined;

    // Process qualifications for Teacher
    let validQualifications: { url: string; name: string; uploadedAt: Date }[] | undefined;
    if (role === 'TEACHER' && qualifications && qualifications.length > 0) {
      validQualifications = qualifications.map(q => ({
        url: q.url,
        name: q.name,
        uploadedAt: new Date(),
      }));
    }

    return this.usersRepository.executeInTransaction(async () => {
      const newUser = await this.usersService.create({
        email,
        fullName,
        password,
        role,
        subjectIds: validSubjectIds,
        isEmailVerified: true,
        qualifications: validQualifications,
        hasUploadedQualifications: !!validQualifications && validQualifications.length > 0,
      });

      const tokenPair = await this.generateTokenPair(newUser);

      await this.authCacheRepo.consumeAuthTicket(email, 'REGISTER', ticket);

      return tokenPair;
    });
  }

  async resetPassword(payload: ResetPasswordPayload) {
    const { email, newPassword, ticket } = payload;
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new BadRequestException('Tài khoản không tồn tại.');

    return this.usersRepository.executeInTransaction(async () => {
      await this.usersService.updatePassword(user._id.toString(), newPassword);
      await this.tokenRepository.deleteAllByUserId(user._id);

      await this.authCacheRepo.consumeAuthTicket(email, 'FORGOT_PASSWORD', ticket);

      return { message: 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.' };
    });
  }

  async changePassword(userId: string, payload: ChangePasswordPayload) {
    const user = await this.usersService.findByIdForAuth(userId);
    if (!user || !user.password) throw new UnauthorizedException('Phiên đăng nhập không hợp lệ.');

    const isPasswordMatch = await bcrypt.compare(payload.oldPassword, user.password);
    if (!isPasswordMatch) throw new BadRequestException('Mật khẩu hiện tại không chính xác.');

    await this.usersService.updatePassword(userId, payload.newPassword);
    await this.tokenRepository.deleteAllByUserId(userId);

    return { message: 'Đổi mật khẩu thành công.' };
  }

  async googleLogin(idToken: string) {
    let ticket;

    try {
      ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
      });
    } catch (verifyError: any) {
      this.logger.error(`[Google Verify Error] Chi tiết: ${verifyError.message}`);
      throw new UnauthorizedException(`Xác thực Google thất bại: ${verifyError.message}`);
    }

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new UnauthorizedException('Token Google không hợp lệ hoặc thiếu thông tin Email');
    }

    try {
      const user = await this.usersService.findOrCreateGoogleUser({
        email: payload.email,
        fullName: payload.name || 'Người dùng Google',
        avatar: payload.picture || '',
        providerId: payload.sub,
      });

      if (user.status !== 'ACTIVE') {
        throw new UnauthorizedException('Tài khoản của bạn đã bị khóa hoặc vô hiệu hóa');
      }

     return this.generateTokenPair(user);
    } catch (dbError: any) {
      if (dbError instanceof HttpException) throw dbError;
      
      this.logger.error(`[Database Error - Google Login] Chi tiết: ${dbError.message}`, dbError.stack);
      throw new InternalServerErrorException('Lỗi hệ thống khi tạo/tìm tài khoản người dùng.');
    }
  }
}