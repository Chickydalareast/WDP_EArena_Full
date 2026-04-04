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
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const ioredis_1 = require("ioredis");
let RedisService = class RedisService {
    redisClient;
    constructor(redisClient) {
        this.redisClient = redisClient;
    }
    onModuleDestroy() {
        this.redisClient.disconnect();
    }
    async get(key) {
        return this.redisClient.get(key);
    }
    async set(key, value, ttlSeconds) {
        if (ttlSeconds) {
            await this.redisClient.set(key, value, 'EX', ttlSeconds);
        }
        else {
            await this.redisClient.set(key, value);
        }
    }
    async del(...keys) {
        if (keys.length > 0) {
            await this.redisClient.del(...keys);
        }
    }
    async setNx(key, value, ttlSeconds) {
        const result = await this.redisClient.set(key, value, 'EX', ttlSeconds, 'NX');
        return result === 'OK';
    }
    async incr(key) {
        return this.redisClient.incr(key);
    }
    async expire(key, ttlSeconds) {
        const result = await this.redisClient.expire(key, ttlSeconds);
        return result === 1;
    }
    async hset(key, field, value) {
        return this.redisClient.hset(key, field, value);
    }
    async hgetall(key) {
        return this.redisClient.hgetall(key);
    }
    async sadd(key, ...members) {
        return this.redisClient.sadd(key, ...members);
    }
    async smembers(key) {
        return this.redisClient.smembers(key);
    }
    getPipeline() {
        return this.redisClient.pipeline();
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('REDIS_CLIENT')),
    __metadata("design:paramtypes", [ioredis_1.Redis])
], RedisService);
//# sourceMappingURL=redis.service.js.map