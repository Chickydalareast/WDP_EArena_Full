// src/modules/auth/auth.controller.ts
import { Controller, Post, Get, Body, Req, Res, HttpCode, HttpStatus, UnauthorizedException } from '@nestjs/common';
import type { Response, Request } from 'express';
import { ConfigService } from '@nestjs/config';

import { AuthService, AuthOtpType } from './auth.service';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

import {
  LoginDto,
  RegisterDto,
  SendOtpDto,
  VerifyOtpDto,
  ChangePasswordDto,
  ResetPasswordDto,
} from './dto'; 

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  private setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
    const isProduction = this.configService.get<string>('NODE_ENV') === 'production';
    
    const accessExpireMinutes = this.configService.get<number>('JWT_ACCESS_EXPIRATION_MINUTES') || 15;
    res.cookie('accessToken', accessToken, {
      httpOnly: true, 
      secure: isProduction,
      sameSite: 'strict', 
      maxAge: accessExpireMinutes * 60 * 1000,
      path: '/', 
    });

    const refreshExpireDays = this.configService.get<number>('JWT_REFRESH_EXPIRATION_DAYS') || 7;
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true, 
      secure: isProduction,
      sameSite: 'strict', 
      maxAge: refreshExpireDays * 24 * 60 * 60 * 1000,
      path: '/api/auth/refresh', 
    });
  }

  private clearAuthCookies(res: Response) {
    const isProduction = this.configService.get<string>('NODE_ENV') === 'production';
    const cookieOptions = { httpOnly: true, secure: isProduction, sameSite: 'strict' as const };
    
    res.clearCookie('accessToken', { ...cookieOptions, path: '/' });
    res.clearCookie('refreshToken', { ...cookieOptions, path: '/api/auth/refresh' });
  }

  @Public() 
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken, user } = await this.authService.login(dto);
    this.setAuthCookies(res, accessToken, refreshToken);
    
    // Tuyệt đối KHÔNG trả token về JSON body. Frontend không có quyền đụng vào.
    return { data: user, message: 'Đăng nhập thành công' }; 
  }

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken, user } = await this.authService.register(dto);
    this.setAuthCookies(res, accessToken, refreshToken);
    
    return { data: user, message: 'Đăng ký tài khoản thành công' };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshTokens(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const oldRefreshToken = req.cookies?.refreshToken;
    if (!oldRefreshToken) throw new UnauthorizedException('Không có chứng chỉ gia hạn phiên');

    const { accessToken, refreshToken } = await this.authService.refreshTokens(oldRefreshToken);
    this.setAuthCookies(res, accessToken, refreshToken);
    
    return { message: 'Phiên đăng nhập đã được gia hạn' };
  }

  // --------------------------------------------------------
  // PROTECTED ENDPOINTS (Yêu cầu JWT Token trong Cookie)
  // --------------------------------------------------------
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@CurrentUser() user: any, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refreshToken;
    const accessToken = req.cookies?.accessToken;

    await this.authService.logout(user.userId, accessToken, refreshToken);
    this.clearAuthCookies(res);

    return { message: 'Đăng xuất thành công' };
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getProfile(@CurrentUser() user: any) {
    // API Cực kỳ quan trọng dành cho Frontend Next.js đồng bộ Zustand
    // Router đã bóc payload từ JWT Strategy, chỉ cần trả thẳng về.
    return { 
      data: {
        id: user.userId,
        email: user.email,
        role: user.role,
      }
    };
  }

  @Public()
  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  async sendOtp(@Body() dto: SendOtpDto) {
    return this.authService.sendOtp({
      email: dto.email,
      type: dto.type as AuthOtpType,
    });
  }

  @Public()
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto.email, dto.otp, dto.type as AuthOtpType);
  }

  // @Public()
  // @Post('register')
  // @HttpCode(HttpStatus.CREATED)
  // async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
  //   const { accessToken, refreshToken, user } = await this.authService.register({
  //     email: dto.email,
  //     fullName: dto.fullName,
  //     password: dto.password,
  //     ticket: dto.ticket,
  //   });
    
  //   this.setRefreshTokenCookie(res, refreshToken);
  //   return { message: 'Đăng ký tài khoản thành công', accessToken, user };
  // }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword({
      email: dto.email,
      newPassword: dto.newPassword,
      ticket: dto.ticket,
    });
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(@CurrentUser() user: any, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(user.userId, {
      oldPassword: dto.oldPassword,
      newPassword: dto.newPassword,
    });
  }
}