import { PricingPlanCode } from '../../subscriptions/schemas/pricing-plan.schema';
export declare class AdminCreatePricingPlanDto {
    name: string;
    code: PricingPlanCode;
    priceMonthly: number;
    priceYearly: number;
    benefits?: string[];
    isActive?: boolean;
}
export declare class AdminUpdatePricingPlanDto {
    name?: string;
    priceMonthly?: number;
    priceYearly?: number;
    benefits?: string[];
    isActive?: boolean;
}
