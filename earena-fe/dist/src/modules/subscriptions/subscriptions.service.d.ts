import { Types } from 'mongoose';
import { PricingPlansRepository } from './repositories/pricing-plans.repository';
import { SubscriptionTransactionsRepository } from './repositories/subscription-transactions.repository';
import { UpgradePlanPayload } from './interfaces/subscription.interface';
import { UsersRepository } from '../users/users.repository';
import { WalletsService } from '../wallets/wallets.service';
export declare class SubscriptionsService {
    private readonly pricingPlansRepo;
    private readonly transactionsRepo;
    private readonly usersRepo;
    private readonly walletsService;
    private readonly logger;
    private readonly PLAN_WEIGHT;
    constructor(pricingPlansRepo: PricingPlansRepository, transactionsRepo: SubscriptionTransactionsRepository, usersRepo: UsersRepository, walletsService: WalletsService);
    upgradePlan(payload: UpgradePlanPayload): Promise<{
        message: string;
        transactionId: string;
        expiresAt: Date;
    }>;
    getAllPlans(): Promise<(import("./schemas/pricing-plan.schema").PricingPlan & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
}
