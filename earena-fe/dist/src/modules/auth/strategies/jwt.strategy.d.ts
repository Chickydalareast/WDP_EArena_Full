import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { AuthCacheRepository } from '../auth.cache.repository';
import { JwtPayload } from '../auth.service';
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly configService;
    private readonly authCacheRepo;
    private readonly logger;
    constructor(configService: ConfigService, authCacheRepo: AuthCacheRepository);
    validate(req: Request, payload: JwtPayload): Promise<{
        userId: string;
        email: string;
        role: string;
        teacherVerificationStatus: string | undefined;
    }>;
}
export {};
