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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthCacheRepository = void 0;
const common_1 = require("@nestjs/common");
const redis_service_1 = require("../../common/redis/redis.service");
const crypto = __importStar(require("crypto"));
let AuthCacheRepository = class AuthCacheRepository {
    redisService;
    PREFIX = 'earena:auth';
    OTP_TTL = 300;
    OTP_COOLDOWN = 60;
    constructor(redisService) {
        this.redisService = redisService;
    }
    async addTokenToBlacklist(token, ttlSeconds) {
        if (ttlSeconds > 0) {
            const key = `${this.PREFIX}:bl:${token}`;
            await this.redisService.set(key, 'revoked', ttlSeconds);
        }
    }
    async isTokenBlacklisted(token) {
        const key = `${this.PREFIX}:bl:${token}`;
        const result = await this.redisService.get(key);
        return result === 'revoked';
    }
    async setOtpWithCooldown(email, otp) {
        const cdKey = `${this.PREFIX}:otp:cd:${email}`;
        const valKey = `${this.PREFIX}:otp:val:${email}`;
        const tryKey = `${this.PREFIX}:otp:try:${email}`;
        const isAllowed = await this.redisService.setNx(cdKey, 'lock', this.OTP_COOLDOWN);
        if (!isAllowed) {
            throw new common_1.BadRequestException(`Vui lòng đợi ${this.OTP_COOLDOWN} giây trước khi yêu cầu mã mới.`);
        }
        const pipeline = this.redisService.getPipeline();
        pipeline.set(valKey, otp, 'EX', this.OTP_TTL);
        pipeline.del(tryKey);
        await pipeline.exec();
    }
    async verifyOtpAttempt(email, inputOtp, maxAttempts = 5) {
        const valKey = `${this.PREFIX}:otp:val:${email}`;
        const tryKey = `${this.PREFIX}:otp:try:${email}`;
        const attempts = await this.redisService.incr(tryKey);
        if (attempts === 1) {
            await this.redisService.expire(tryKey, this.OTP_TTL);
        }
        if (attempts > maxAttempts) {
            await this.redisService.del(valKey);
            throw new common_1.BadRequestException('Nhập sai quá nhiều lần. Vui lòng yêu cầu mã OTP mới.');
        }
        const storedOtp = await this.redisService.get(valKey);
        if (!storedOtp) {
            throw new common_1.BadRequestException('Mã OTP đã hết hạn hoặc không tồn tại.');
        }
        if (storedOtp !== inputOtp) {
            throw new common_1.BadRequestException(`Mã OTP không hợp lệ. Bạn còn ${maxAttempts - attempts} lần thử.`);
        }
        await this.redisService.del(valKey, tryKey);
    }
    async createAuthTicket(email, type) {
        const ticket = crypto.randomBytes(32).toString('hex');
        const key = `${this.PREFIX}:ticket:${type}:${email}`;
        await this.redisService.set(key, ticket, 900);
        return ticket;
    }
    async consumeAuthTicket(email, type, inputTicket) {
        const key = `${this.PREFIX}:ticket:${type}:${email}`;
        const storedTicket = await this.redisService.get(key);
        if (!storedTicket || storedTicket !== inputTicket) {
            throw new common_1.BadRequestException('Phiên xác thực không hợp lệ hoặc đã hết hạn.');
        }
        await this.redisService.del(key);
    }
    async assertRegisterTicketValid(email, inputTicket) {
        const key = `${this.PREFIX}:ticket:REGISTER:${email}`;
        const storedTicket = await this.redisService.get(key);
        if (!storedTicket || storedTicket !== inputTicket) {
            throw new common_1.BadRequestException('Phiên xác thực không hợp lệ hoặc đã hết hạn.');
        }
    }
    async setRefreshGracePeriod(oldToken, newTokens) {
        const key = `${this.PREFIX}:grace:${oldToken}`;
        await this.redisService.set(key, JSON.stringify(newTokens), 45);
    }
    async getRefreshGracePeriod(oldToken) {
        const key = `${this.PREFIX}:grace:${oldToken}`;
        const data = await this.redisService.get(key);
        return data ? JSON.parse(data) : null;
    }
};
exports.AuthCacheRepository = AuthCacheRepository;
exports.AuthCacheRepository = AuthCacheRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService])
], AuthCacheRepository);
//# sourceMappingURL=auth.cache.repository.js.map