import type { Response, Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, SendOtpDto, VerifyOtpDto, ChangePasswordDto, ResetPasswordDto, GoogleLoginDto } from './dto';
import { UserResponseDto } from '../users/dto';
export declare class AuthController {
    private readonly authService;
    private readonly configService;
    constructor(authService: AuthService, configService: ConfigService);
    private getBaseCookieOptions;
    private setAuthCookies;
    private clearAuthCookies;
    private serializeUser;
    login(dto: LoginDto, res: Response): Promise<{
        message: string;
        data: UserResponseDto;
    }>;
    register(dto: RegisterDto, res: Response): Promise<{
        message: string;
        data: UserResponseDto;
    }>;
    uploadRegisterQualification(file: Express.Multer.File, email: string, ticket: string, name: string): Promise<{
        message: string;
        data: {
            url: string;
            name: string;
        };
    }>;
    refreshTokens(req: Request, res: Response): Promise<{
        message: string;
    }>;
    sendOtp(dto: SendOtpDto): Promise<{
        message: string;
    }>;
    verifyOtp(dto: VerifyOtpDto): Promise<{
        success: boolean;
        message: string;
        ticket: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    googleLogin(dto: GoogleLoginDto, res: Response): Promise<{
        message: string;
        data: UserResponseDto;
    }>;
    logout(user: any, req: Request, res: Response): Promise<{
        message: string;
    }>;
    getProfile(user: any): Promise<{
        data: UserResponseDto;
    }>;
    changePassword(user: any, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
}
