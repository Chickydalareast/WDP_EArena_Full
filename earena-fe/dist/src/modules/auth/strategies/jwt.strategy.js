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
var JwtStrategy_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtStrategy = void 0;
const passport_jwt_1 = require("passport-jwt");
const passport_1 = require("@nestjs/passport");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const auth_cache_repository_1 = require("../auth.cache.repository");
let JwtStrategy = JwtStrategy_1 = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy, 'jwt') {
    configService;
    authCacheRepo;
    logger = new common_1.Logger(JwtStrategy_1.name);
    constructor(configService, authCacheRepo) {
        const secret = configService.get('JWT_ACCESS_SECRET');
        if (!secret) {
            throw new Error('CRITICAL FATAL: JWT_ACCESS_SECRET is not defined in environment variables.');
        }
        super({
            jwtFromRequest: (req) => {
                return req?.cookies?.['accessToken'] || null;
            },
            ignoreExpiration: false,
            secretOrKey: secret,
            passReqToCallback: true,
        });
        this.configService = configService;
        this.authCacheRepo = authCacheRepo;
    }
    async validate(req, payload) {
        const rawToken = req.cookies['accessToken'];
        if (!rawToken)
            throw new common_1.UnauthorizedException('Không tìm thấy chứng chỉ xác thực');
        try {
            const isBlacklisted = await this.authCacheRepo.isTokenBlacklisted(rawToken);
            if (isBlacklisted) {
                throw new common_1.UnauthorizedException('Phiên làm việc đã bị hủy hoặc bạn đã đăng xuất.');
            }
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException)
                throw error;
            this.logger.error(`Redis check failed for token validation: ${error instanceof Error ? error.message : error}`);
            throw new common_1.UnauthorizedException('Hệ thống xác thực đang gián đoạn, vui lòng thử lại sau.');
        }
        return {
            userId: payload.userId,
            email: payload.email,
            role: payload.role,
            teacherVerificationStatus: payload.tvs,
        };
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = JwtStrategy_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        auth_cache_repository_1.AuthCacheRepository])
], JwtStrategy);
//# sourceMappingURL=jwt.strategy.js.map