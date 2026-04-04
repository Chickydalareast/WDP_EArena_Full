import { RedisService } from '../../common/redis/redis.service';
export declare class AuthCacheRepository {
    private readonly redisService;
    private readonly PREFIX;
    private readonly OTP_TTL;
    private readonly OTP_COOLDOWN;
    constructor(redisService: RedisService);
    addTokenToBlacklist(token: string, ttlSeconds: number): Promise<void>;
    isTokenBlacklisted(token: string): Promise<boolean>;
    setOtpWithCooldown(email: string, otp: string): Promise<void>;
    verifyOtpAttempt(email: string, inputOtp: string, maxAttempts?: number): Promise<void>;
    createAuthTicket(email: string, type: string): Promise<string>;
    consumeAuthTicket(email: string, type: string, inputTicket: string): Promise<void>;
    assertRegisterTicketValid(email: string, inputTicket: string): Promise<void>;
    setRefreshGracePeriod(oldToken: string, newTokens: {
        accessToken: string;
        refreshToken: string;
    }): Promise<void>;
    getRefreshGracePeriod(oldToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    } | null>;
}
