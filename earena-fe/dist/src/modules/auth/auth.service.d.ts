import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { UsersRepository } from '../users/users.repository';
import { TokenRepository } from './token.repository';
import { AuthCacheRepository } from './auth.cache.repository';
import { MailService } from '../mail/mail.service';
import { UserDocument } from '../users/schemas/user.schema';
import type { ICloudinaryProvider } from '../media/interfaces/storage-provider.interface';
export type AuthOtpType = 'REGISTER' | 'FORGOT_PASSWORD';
export interface JwtPayload {
    userId: string;
    email: string;
    role: string;
    tvs?: string;
}
export type LoginPayload = {
    email: string;
    password: string;
};
export type SendOtpPayload = {
    email: string;
    type: AuthOtpType;
};
export type RegisterPayload = {
    email: string;
    fullName: string;
    password: string;
    ticket: string;
    role?: 'STUDENT' | 'TEACHER';
    subjectIds?: string[];
    qualifications?: {
        url: string;
        name: string;
    }[];
};
export type ResetPasswordPayload = {
    email: string;
    newPassword: string;
    ticket: string;
};
export type ChangePasswordPayload = {
    oldPassword: string;
    newPassword: string;
};
export declare class AuthService {
    private readonly usersService;
    private readonly usersRepository;
    private readonly jwtService;
    private readonly configService;
    private readonly tokenRepository;
    private readonly authCacheRepo;
    private readonly mailService;
    private readonly cloudinaryProvider;
    private readonly logger;
    private googleClient;
    constructor(usersService: UsersService, usersRepository: UsersRepository, jwtService: JwtService, configService: ConfigService, tokenRepository: TokenRepository, authCacheRepo: AuthCacheRepository, mailService: MailService, cloudinaryProvider: ICloudinaryProvider);
    private generateTokenPair;
    login(payload: LoginPayload): Promise<{
        accessToken: string;
        refreshToken: string;
        user: UserDocument;
    }>;
    getMe(userId: string): Promise<UserDocument>;
    refreshTokens(oldRefreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(userId: string, accessToken?: string, refreshToken?: string): Promise<void>;
    private generateSecureOtp;
    sendOtp(payload: SendOtpPayload): Promise<{
        message: string;
    }>;
    verifyOtp(email: string, otp: string, type: AuthOtpType): Promise<{
        success: boolean;
        message: string;
        ticket: string;
    }>;
    private readonly registerQualificationFolder;
    uploadRegistrationQualificationImage(payload: {
        email: string;
        ticket: string;
        name: string;
        file: Express.Multer.File;
    }): Promise<{
        url: string;
        name: string;
    }>;
    register(payload: RegisterPayload): Promise<{
        accessToken: string;
        refreshToken: string;
        user: UserDocument;
    }>;
    resetPassword(payload: ResetPasswordPayload): Promise<{
        message: string;
    }>;
    changePassword(userId: string, payload: ChangePasswordPayload): Promise<{
        message: string;
    }>;
    googleLogin(idToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: UserDocument;
    }>;
}
