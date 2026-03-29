import { z } from 'zod';

export enum PricingPlanCode {
    FREE = 'FREE',
    PRO = 'PRO',
    ENTERPRISE = 'ENTERPRISE',
}

export interface IPricingPlan {
    _id: string;
    name: string;
    code: PricingPlanCode;
    priceMonthly: number;
    priceYearly: number;
    benefits: string[];
}

export const upgradeSubscriptionSchema = z.object({
    planId: z.string().min(1, 'Vui lòng chọn gói cước hợp lệ'),
    billingCycle: z.enum(['MONTHLY', 'YEARLY']),
});

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