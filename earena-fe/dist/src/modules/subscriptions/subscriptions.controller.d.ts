import { SubscriptionsService } from './subscriptions.service';
import { UpgradePlanDto } from './dto/subscription.dto';
export declare class SubscriptionsController {
    private readonly subscriptionsService;
    constructor(subscriptionsService: SubscriptionsService);
    getAllPlans(): Promise<{
        message: string;
        data: (import("./schemas/pricing-plan.schema").PricingPlan & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
    }>;
    upgradePlan(dto: UpgradePlanDto, userId: string): Promise<{
        message: string;
        transactionId: string;
        expiresAt: Date;
    }>;
}
