import {
  Controller, Post, Get, Body, Req, Res, HttpCode, HttpStatus, UnauthorizedException,
  BadRequestException
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';

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
  GoogleLoginDto,
} from './dto';
import { UserResponseDto } from '../users/dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) { }

  private getBaseCookieOptions() {
    const isProduction = this.configService.get<string>('NODE_ENV') === 'production';
    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: (isProduction ? 'strict' : 'lax') as 'strict' | 'lax',
    };
  }

  private setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
    const baseOptions = this.getBaseCookieOptions();
    const accessExpireMinutes = this.configService.get<number>('JWT_ACCESS_EXPIRATION_MINUTES') || 15;
    const refreshExpireDays = this.configService.get<number>('JWT_REFRESH_EXPIRATION_DAYS') || 7;

    res.cookie('accessToken', accessToken, {
      ...baseOptions,
      path: '/',
      maxAge: accessExpireMinutes * 60 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      ...baseOptions,
      path: '/api/v1/auth',
      maxAge: refreshExpireDays * 24 * 60 * 60 * 1000,
    });
  }

  private clearAuthCookies(res: Response) {
    const baseOptions = this.getBaseCookieOptions();
    res.clearCookie('accessToken', { ...baseOptions, path: '/' });
    res.clearCookie('refreshToken', { ...baseOptions, path: '/api/v1/auth' });
  }

  private serializeUser(user: any) {
    const userObj = user.toObject ? user.toObject() : user;
    return plainToInstance(UserResponseDto, userObj, {
      excludeExtraneousValues: true
    });
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken, user } = await this.authService.login({
      email: dto.email,
      password: dto.password
    });

    this.setAuthCookies(res, accessToken, refreshToken);

    return {
      message: 'Đăng nhập thành công',
      data: this.serializeUser(user),
    };
  }

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken, user } = await this.authService.register({
      email: dto.email,
      fullName: dto.fullName,
      password: dto.password,
      ticket: dto.ticket,
      role: dto.role,
      subjectIds: dto.subjectIds,
    });

    this.setAuthCookies(res, accessToken, refreshToken);

    return {
      message: 'Đăng ký tài khoản thành công',
      data: this.serializeUser(user),
    };
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

  @Public()
  @Post('google')
  @HttpCode(HttpStatus.OK)
  async googleLogin(
    @Body() dto: GoogleLoginDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const token = dto.idToken || dto.credential;

    if (!token) {
      throw new BadRequestException('Payload không hợp lệ. Thiếu idToken hoặc credential.');
    }

    const { accessToken, refreshToken, user } = await this.authService.googleLogin(token);
    this.setAuthCookies(res, accessToken, refreshToken);

    return {
      message: 'Đăng nhập Google thành công',
      data: this.serializeUser(user),
    };
  }

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
    const fullUser = await this.authService.getMe(user.userId);

    return {
      data: this.serializeUser(fullUser)
    };
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