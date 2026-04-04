import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { IS_OPTIONAL_AUTH_KEY } from '../decorators/optional-auth.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const isOptionalAuth = this.reflector.getAllAndOverride<boolean>(IS_OPTIONAL_AUTH_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (err) {
      throw err;
    }

    if (isOptionalAuth) {
      if (info instanceof Error) {
        if (info.name === 'TokenExpiredError') {
          throw new UnauthorizedException('Access token expired');
        }
        if (info.name === 'JsonWebTokenError') {
          throw new UnauthorizedException('Invalid access token');
        }
      }
      
      return user || null;
    }

    if (!user) {
      throw new UnauthorizedException(info?.message || 'Không có quyền truy cập');
    }

    return user;
  }
}