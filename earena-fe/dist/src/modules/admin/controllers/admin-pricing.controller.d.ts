import { AdminService } from '../admin.service';
import { AdminCreatePricingPlanDto, AdminUpdatePricingPlanDto } from '../dto/admin-pricing.dto';
export declare class AdminPricingController {
    private readonly adminService;
    constructor(adminService: AdminService);
    list(): Promise<(import("../../subscriptions/schemas/pricing-plan.schema").PricingPlan & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    create(dto: AdminCreatePricingPlanDto): Promise<import("../../subscriptions/schemas/pricing-plan.schema").PricingPlanDocument>;
    update(id: string, dto: AdminUpdatePricingPlanDto): Promise<import("../../subscriptions/schemas/pricing-plan.schema").PricingPlanDocument>;
}
