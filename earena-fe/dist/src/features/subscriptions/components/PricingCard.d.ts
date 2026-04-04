import { ReactNode } from 'react';
import { IPricingPlan } from '../types/subscription.schema';
interface PricingCardProps {
    plan: IPricingPlan;
    actionButton: ReactNode;
    isPopular?: boolean;
}
export declare function PricingCard({ plan, actionButton, isPopular }: PricingCardProps): any;
export declare function PricingCardSkeleton(): any;
export {};
