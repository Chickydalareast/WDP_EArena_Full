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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimitGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const redis_service_1 = require("../redis/redis.service");
const rate_limit_decorator_1 = require("../decorators/rate-limit.decorator");
let RateLimitGuard = class RateLimitGuard {
    reflector;
    redisService;
    DEFAULT_LIMIT = { points: 120, duration: 60 };
    constructor(reflector, redisService) {
        this.reflector = reflector;
        this.redisService = redisService;
    }
    async canActivate(context) {
        let rateLimitOptions = this.reflector.getAllAndOverride(rate_limit_decorator_1.RATE_LIMIT_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!rateLimitOptions) {
            rateLimitOptions = this.DEFAULT_LIMIT;
        }
        const request = context.switchToHttp().getRequest();
        const ip = request.headers['x-forwarded-for'] || request.ip || request.connection?.remoteAddress || 'unknown';
        const routePath = request.route.path;
        const key = `rate_limit:${ip}:${routePath}`;
        const pipeline = this.redisService.getPipeline();
        pipeline.incr(key);
        pipeline.ttl(key);
        const results = await pipeline.exec();
        if (!results) {
            throw new common_1.HttpException('Redis Pipeline Failed', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        const incrError = results[0][0];
        const ttlError = results[1][0];
        if (incrError || ttlError) {
            throw new common_1.HttpException('Redis Error', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        const requestsMade = results[0][1];
        const currentTtl = results[1][1];
        if (requestsMade === 1 || currentTtl === -1) {
            await this.redisService.expire(key, rateLimitOptions.duration);
        }
        if (requestsMade > rateLimitOptions.points) {
            throw new common_1.HttpException(`Hệ thống đang chịu tải cao. Vui lòng thử lại sau ${rateLimitOptions.duration} giây!`, common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
        return true;
    }
};
exports.RateLimitGuard = RateLimitGuard;
exports.RateLimitGuard = RateLimitGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        redis_service_1.RedisService])
], RateLimitGuard);
//# sourceMappingURL=rate-limit.guard.js.map