// src/modules/auth/strategies/jwt.strategy.ts
import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { AuthCacheRepository } from '../auth.cache.repository'; 

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authCacheRepo: AuthCacheRepository, 
  ) {
    super({
      jwtFromRequest: (req: Request) => {
        let token = null;
        if (req && req.cookies) {
          token = req.cookies['accessToken'];
        }
        return token;
      },
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'fallback_secret',
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    const rawToken = req.cookies['accessToken'];
    if (!rawToken) throw new UnauthorizedException('Không tìm thấy chứng chỉ xác thực');

    // Trade-off Security vs Performance: Kiểm tra Blacklist mỗi request.
    const isBlacklisted = await this.authCacheRepo.isTokenBlacklisted(rawToken);
    
    if (isBlacklisted) {
      throw new UnauthorizedException('Phiên làm việc đã bị hủy. Hệ thống nghi ngờ gian lận.');
    }

    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };
  }
}