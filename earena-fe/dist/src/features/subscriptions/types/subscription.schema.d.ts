import { z } from 'zod';
export declare enum PricingPlanCode {
    FREE = "FREE",
    PRO = "PRO",
    ENTERPRISE = "ENTERPRISE"
}
export interface IPricingPlan {
    _id: string;
    name: string;
    code: PricingPlanCode;
    priceMonthly: number;
    priceYearly: number;
    benefits: string[];
}
export declare const upgradeSubscriptionSchema: any;
export type UpgradeSubscriptionDTO = z.infer<typeof upgradeSubscriptionSchema>;
export interface UpgradeSubscriptionResponse {
    message: string;
    transactionId: string;
    expiresAt: string;
}
export interface GetPlansResponse {
    message?: string;
    data: IPricingPlan[];
}
