export declare const RATE_LIMIT_KEY = "rate_limit";
export interface RateLimitOptions {
    points: number;
    duration: number;
}
export declare const RateLimit: (options: RateLimitOptions) => import("@nestjs/common").CustomDecorator<string>;
