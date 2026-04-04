import { OnModuleInit } from '@nestjs/common';
import { PricingPlansRepository } from '../subscriptions/repositories/pricing-plans.repository';
export declare class AdminSeederService implements OnModuleInit {
    private readonly pricingPlansRepo;
    private readonly logger;
    constructor(pricingPlansRepo: PricingPlansRepository);
    onModuleInit(): Promise<void>;
    private seedPricingPlansIdempotent;
}
