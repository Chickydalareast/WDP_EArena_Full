import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { AuthCacheRepository } from '../auth.cache.repository'; 
import { JwtPayload } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly authCacheRepo: AuthCacheRepository, 
  ) {
    const secret = configService.get<string>('JWT_ACCESS_SECRET');
    if (!secret) {
      throw new Error('CRITICAL FATAL: JWT_ACCESS_SECRET is not defined in environment variables.');
    }

    super({
      jwtFromRequest: (req: Request) => {
        return req?.cookies?.['accessToken'] || null;
      },
      ignoreExpiration: false,
      secretOrKey: secret,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    const rawToken = req.cookies['accessToken'];
    if (!rawToken) throw new UnauthorizedException('Không tìm thấy chứng chỉ xác thực');

    try {
      const isBlacklisted = await this.authCacheRepo.isTokenBlacklisted(rawToken);
      if (isBlacklisted) {
        throw new UnauthorizedException('Phiên làm việc đã bị hủy hoặc bạn đã đăng xuất.');
      }
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      
      this.logger.error(`Redis check failed for token validation: ${error instanceof Error ? error.message : error}`);
      throw new UnauthorizedException('Hệ thống xác thực đang gián đoạn, vui lòng thử lại sau.');
    }

    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      teacherVerificationStatus: payload.tvs,
    };
  }
}