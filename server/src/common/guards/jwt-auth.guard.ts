import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Kiểm tra xem route có gắn @Public() không
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (isPublic) {
      return true; // Bypass nếu là Public
    }
    
    // Nếu không Public, đưa qua JwtStrategy để check Token & Redis Blacklist
    return super.canActivate(context);
  }

handleRequest(err: any, user: any, info: any) {
  if (err || !user) {
    throw err || new UnauthorizedException('Authentication failed or token missing');
  }
  return user;
}
}