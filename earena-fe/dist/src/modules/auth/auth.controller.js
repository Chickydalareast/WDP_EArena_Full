"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const config_1 = require("@nestjs/config");
const class_transformer_1 = require("class-transformer");
const auth_service_1 = require("./auth.service");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const dto_1 = require("./dto");
const dto_2 = require("../users/dto");
let AuthController = class AuthController {
    authService;
    configService;
    constructor(authService, configService) {
        this.authService = authService;
        this.configService = configService;
    }
    getBaseCookieOptions() {
        const isProduction = this.configService.get('NODE_ENV') === 'production';
        return {
            httpOnly: true,
            secure: isProduction,
            sameSite: (isProduction ? 'strict' : 'lax'),
        };
    }
    setAuthCookies(res, accessToken, refreshToken) {
        const baseOptions = this.getBaseCookieOptions();
        const accessExpireMinutes = this.configService.get('JWT_ACCESS_EXPIRATION_MINUTES') || 15;
        const refreshExpireDays = this.configService.get('JWT_REFRESH_EXPIRATION_DAYS') || 7;
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
    clearAuthCookies(res) {
        const baseOptions = this.getBaseCookieOptions();
        res.clearCookie('accessToken', { ...baseOptions, path: '/' });
        res.clearCookie('refreshToken', { ...baseOptions, path: '/api/v1/auth' });
    }
    serializeUser(user) {
        const userObj = user.toObject ? user.toObject() : user;
        return (0, class_transformer_1.plainToInstance)(dto_2.UserResponseDto, userObj, {
            excludeExtraneousValues: true
        });
    }
    async login(dto, res) {
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
    async register(dto, res) {
        const { accessToken, refreshToken, user } = await this.authService.register({
            email: dto.email,
            fullName: dto.fullName,
            password: dto.password,
            ticket: dto.ticket,
            role: dto.role,
            subjectIds: dto.subjectIds,
            qualifications: dto.qualifications,
        });
        this.setAuthCookies(res, accessToken, refreshToken);
        return {
            message: 'Đăng ký tài khoản thành công',
            data: this.serializeUser(user),
        };
    }
    async uploadRegisterQualification(file, email, ticket, name) {
        if (!email?.trim() || !ticket?.trim() || !name?.trim()) {
            throw new common_1.BadRequestException('Thiếu email, ticket hoặc tên bằng cấp.');
        }
        const data = await this.authService.uploadRegistrationQualificationImage({
            email: email.trim().toLowerCase(),
            ticket: ticket.trim(),
            name: name.trim(),
            file,
        });
        return {
            message: 'Tải ảnh bằng cấp thành công',
            data,
        };
    }
    async refreshTokens(req, res) {
        const oldRefreshToken = req.cookies?.refreshToken;
        if (!oldRefreshToken)
            throw new common_1.UnauthorizedException('Không có chứng chỉ gia hạn phiên');
        const { accessToken, refreshToken } = await this.authService.refreshTokens(oldRefreshToken);
        this.setAuthCookies(res, accessToken, refreshToken);
        return { message: 'Phiên đăng nhập đã được gia hạn' };
    }
    async sendOtp(dto) {
        return this.authService.sendOtp({
            email: dto.email,
            type: dto.type,
        });
    }
    async verifyOtp(dto) {
        return this.authService.verifyOtp(dto.email, dto.otp, dto.type);
    }
    async resetPassword(dto) {
        return this.authService.resetPassword({
            email: dto.email,
            newPassword: dto.newPassword,
            ticket: dto.ticket,
        });
    }
    async googleLogin(dto, res) {
        const token = dto.idToken || dto.credential;
        if (!token) {
            throw new common_1.BadRequestException('Payload không hợp lệ. Thiếu idToken hoặc credential.');
        }
        const { accessToken, refreshToken, user } = await this.authService.googleLogin(token);
        this.setAuthCookies(res, accessToken, refreshToken);
        return {
            message: 'Đăng nhập Google thành công',
            data: this.serializeUser(user),
        };
    }
    async logout(user, req, res) {
        const refreshToken = req.cookies?.refreshToken;
        const accessToken = req.cookies?.accessToken;
        await this.authService.logout(user.userId, accessToken, refreshToken);
        this.clearAuthCookies(res);
        return { message: 'Đăng xuất thành công' };
    }
    async getProfile(user) {
        const fullUser = await this.authService.getMe(user.userId);
        return {
            data: this.serializeUser(fullUser)
        };
    }
    async changePassword(user, dto) {
        return this.authService.changePassword(user.userId, {
            oldPassword: dto.oldPassword,
            newPassword: dto.newPassword,
        });
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.LoginDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('register'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.RegisterDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('register/qualification-upload'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.memoryStorage)(),
    })),
    __param(0, (0, common_1.UploadedFile)(new common_1.ParseFilePipe({
        validators: [new common_1.MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 })],
    }))),
    __param(1, (0, common_1.Body)('email')),
    __param(2, (0, common_1.Body)('ticket')),
    __param(3, (0, common_1.Body)('name')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "uploadRegisterQualification", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('refresh'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refreshTokens", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('send-otp'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.SendOtpDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "sendOtp", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('verify-otp'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.VerifyOtpDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyOtp", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('reset-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.ResetPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('google'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.GoogleLoginDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "googleLogin", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Post)('change-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.ChangePasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "changePassword", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        config_1.ConfigService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map