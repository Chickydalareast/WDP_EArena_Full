"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const google_auth_library_1 = require("google-auth-library");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = __importStar(require("bcrypt"));
const crypto = __importStar(require("crypto"));
const users_service_1 = require("../users/users.service");
const users_repository_1 = require("../users/users.repository");
const token_repository_1 = require("./token.repository");
const auth_cache_repository_1 = require("./auth.cache.repository");
const mail_service_1 = require("../mail/mail.service");
const user_schema_1 = require("../users/schemas/user.schema");
const user_role_enum_1 = require("../../common/enums/user-role.enum");
const storage_provider_interface_1 = require("../media/interfaces/storage-provider.interface");
let AuthService = AuthService_1 = class AuthService {
    usersService;
    usersRepository;
    jwtService;
    configService;
    tokenRepository;
    authCacheRepo;
    mailService;
    cloudinaryProvider;
    logger = new common_1.Logger(AuthService_1.name);
    googleClient;
    constructor(usersService, usersRepository, jwtService, configService, tokenRepository, authCacheRepo, mailService, cloudinaryProvider) {
        this.usersService = usersService;
        this.usersRepository = usersRepository;
        this.jwtService = jwtService;
        this.configService = configService;
        this.tokenRepository = tokenRepository;
        this.authCacheRepo = authCacheRepo;
        this.mailService = mailService;
        this.cloudinaryProvider = cloudinaryProvider;
        this.googleClient = new google_auth_library_1.OAuth2Client(this.configService.get('GOOGLE_CLIENT_ID'));
    }
    async generateTokenPair(user) {
        const payload = {
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        };
        if (user.role === user_role_enum_1.UserRole.TEACHER) {
            payload.tvs =
                user.teacherVerificationStatus ?? user_schema_1.TeacherVerificationStatus.PENDING;
        }
        const accessToken = this.jwtService.sign(payload);
        const refreshToken = crypto.randomBytes(64).toString('hex');
        const refreshExpireDays = this.configService.get('JWT_REFRESH_EXPIRATION_DAYS') || 7;
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + refreshExpireDays);
        await this.tokenRepository.saveToken(refreshToken, user._id, expiresAt);
        return { accessToken, refreshToken, user };
    }
    async login(payload) {
        const user = await this.usersService.findByEmailForAuth(payload.email);
        if (!user || !user.password)
            throw new common_1.UnauthorizedException('Email hoặc mật khẩu không chính xác');
        const isPasswordValid = await bcrypt.compare(payload.password, user.password);
        if (!isPasswordValid)
            throw new common_1.UnauthorizedException('Email hoặc mật khẩu không chính xác');
        return this.generateTokenPair(user);
    }
    async getMe(userId) {
        const user = await this.usersService.findById(userId);
        if (!user)
            throw new common_1.UnauthorizedException('Không tìm thấy thông tin người dùng');
        return user;
    }
    async refreshTokens(oldRefreshToken) {
        const gracePeriodTokens = await this.authCacheRepo.getRefreshGracePeriod(oldRefreshToken);
        if (gracePeriodTokens) {
            this.logger.debug(`[Race Condition Shield] Trả về token từ Grace Period cho request đến trễ.`);
            return gracePeriodTokens;
        }
        return this.tokenRepository.executeInTransaction(async () => {
            const tokenDoc = await this.tokenRepository.findByToken(oldRefreshToken);
            if (!tokenDoc) {
                throw new common_1.UnauthorizedException('Refresh token không hợp lệ hoặc đã bị thu hồi.');
            }
            if (tokenDoc.expiresAt < new Date()) {
                await this.tokenRepository.deleteByToken(oldRefreshToken);
                throw new common_1.UnauthorizedException('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.');
            }
            await this.tokenRepository.deleteByToken(oldRefreshToken);
            const user = await this.usersService.findById(tokenDoc.userId.toString());
            if (!user) {
                throw new common_1.UnauthorizedException('Không tìm thấy tài khoản liên kết với phiên này.');
            }
            const newTokens = await this.generateTokenPair(user);
            await this.authCacheRepo.setRefreshGracePeriod(oldRefreshToken, {
                accessToken: newTokens.accessToken,
                refreshToken: newTokens.refreshToken
            });
            return newTokens;
        });
    }
    async logout(userId, accessToken, refreshToken) {
        if (refreshToken) {
            await this.tokenRepository.deleteByToken(refreshToken);
        }
        if (accessToken) {
            try {
                const decoded = this.jwtService.verify(accessToken, {
                    secret: this.configService.get('JWT_ACCESS_SECRET')
                });
                const now = Math.floor(Date.now() / 1000);
                const ttl = decoded.exp - now;
                if (ttl > 0) {
                    await this.authCacheRepo.addTokenToBlacklist(accessToken, ttl);
                }
            }
            catch (error) {
                this.logger.warn(`Phát hiện Access Token không hợp lệ trong quá trình Logout (User: ${userId})`);
            }
        }
    }
    generateSecureOtp() {
        return crypto.randomInt(100000, 999999).toString();
    }
    async sendOtp(payload) {
        const { email, type } = payload;
        const existingUser = await this.usersService.findByEmail(email);
        if (type === 'REGISTER' && existingUser)
            throw new common_1.BadRequestException('Email này đã được đăng ký.');
        if (type === 'FORGOT_PASSWORD' && !existingUser)
            throw new common_1.BadRequestException('Email không tồn tại.');
        const otp = this.generateSecureOtp();
        await this.authCacheRepo.setOtpWithCooldown(email, otp);
        const name = existingUser ? existingUser.fullName : 'Học viên';
        const isQueued = await this.mailService.sendUserOtp(email, name, otp);
        if (!isQueued)
            throw new common_1.InternalServerErrorException('Hệ thống mail đang bận. Vui lòng thử lại sau.');
        if (this.configService.get('NODE_ENV') === 'development') {
            this.logger.warn(`[DEV] OTP cho ${email} (type=${type}): ${otp} — Nếu không thấy email: kiểm tra Redis/Bull, log MailProcessor và cấu hình SMTP (MAIL_*).`);
        }
        return { message: 'Mã OTP đã được gửi đến email của bạn.' };
    }
    async verifyOtp(email, otp, type) {
        await this.authCacheRepo.verifyOtpAttempt(email, otp);
        const ticket = await this.authCacheRepo.createAuthTicket(email, type);
        return { success: true, message: 'Xác thực OTP thành công.', ticket };
    }
    registerQualificationFolder = 'earena/register-qualifications';
    async uploadRegistrationQualificationImage(payload) {
        const allowed = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
        if (!allowed.has(payload.file.mimetype)) {
            throw new common_1.BadRequestException('Chỉ chấp nhận ảnh JPEG, PNG, WebP hoặc GIF.');
        }
        await this.authCacheRepo.assertRegisterTicketValid(payload.email, payload.ticket);
        const meta = await this.cloudinaryProvider.uploadImageBuffer(payload.file.buffer, this.registerQualificationFolder);
        return {
            url: meta.url,
            name: payload.name,
        };
    }
    async register(payload) {
        const { email, fullName, password, ticket, role, subjectIds, qualifications } = payload;
        const existingUser = await this.usersService.findByEmail(email);
        if (existingUser)
            throw new common_1.BadRequestException('Email đã được đăng ký.');
        const validSubjectIds = role === 'TEACHER' ? subjectIds : undefined;
        let validQualifications;
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
    async resetPassword(payload) {
        const { email, newPassword, ticket } = payload;
        const user = await this.usersService.findByEmail(email);
        if (!user)
            throw new common_1.BadRequestException('Tài khoản không tồn tại.');
        return this.usersRepository.executeInTransaction(async () => {
            await this.usersService.updatePassword(user._id.toString(), newPassword);
            await this.tokenRepository.deleteAllByUserId(user._id);
            await this.authCacheRepo.consumeAuthTicket(email, 'FORGOT_PASSWORD', ticket);
            return { message: 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.' };
        });
    }
    async changePassword(userId, payload) {
        const user = await this.usersService.findByIdForAuth(userId);
        if (!user || !user.password)
            throw new common_1.UnauthorizedException('Phiên đăng nhập không hợp lệ.');
        const isPasswordMatch = await bcrypt.compare(payload.oldPassword, user.password);
        if (!isPasswordMatch)
            throw new common_1.BadRequestException('Mật khẩu hiện tại không chính xác.');
        await this.usersService.updatePassword(userId, payload.newPassword);
        await this.tokenRepository.deleteAllByUserId(userId);
        return { message: 'Đổi mật khẩu thành công.' };
    }
    async googleLogin(idToken) {
        let ticket;
        try {
            ticket = await this.googleClient.verifyIdToken({
                idToken,
                audience: this.configService.get('GOOGLE_CLIENT_ID'),
            });
        }
        catch (verifyError) {
            this.logger.error(`[Google Verify Error] Chi tiết: ${verifyError.message}`);
            throw new common_1.UnauthorizedException(`Xác thực Google thất bại: ${verifyError.message}`);
        }
        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            throw new common_1.UnauthorizedException('Token Google không hợp lệ hoặc thiếu thông tin Email');
        }
        try {
            const user = await this.usersService.findOrCreateGoogleUser({
                email: payload.email,
                fullName: payload.name || 'Người dùng Google',
                avatar: payload.picture || '',
                providerId: payload.sub,
            });
            if (user.status !== 'ACTIVE') {
                throw new common_1.UnauthorizedException('Tài khoản của bạn đã bị khóa hoặc vô hiệu hóa');
            }
            return this.generateTokenPair(user);
        }
        catch (dbError) {
            if (dbError instanceof common_1.HttpException)
                throw dbError;
            this.logger.error(`[Database Error - Google Login] Chi tiết: ${dbError.message}`, dbError.stack);
            throw new common_1.InternalServerErrorException('Lỗi hệ thống khi tạo/tìm tài khoản người dùng.');
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(7, (0, common_1.Inject)(storage_provider_interface_1.CLOUDINARY_PROVIDER)),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        users_repository_1.UsersRepository,
        jwt_1.JwtService,
        config_1.ConfigService,
        token_repository_1.TokenRepository,
        auth_cache_repository_1.AuthCacheRepository,
        mail_service_1.MailService, Object])
], AuthService);
//# sourceMappingURL=auth.service.js.map