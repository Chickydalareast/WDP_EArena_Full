import type { PricingPlanCode } from '@/features/subscriptions/types/subscription.schema';
export interface UserSession {
    id: string;
    email: string;
    role: 'STUDENT' | 'TEACHER' | 'ADMIN';
    fullName?: string;
    avatar?: string;
    phone?: string;
    dateOfBirth?: string | Date;
    balance: number;
    subscription: {
        planId: string;
        planCode: PricingPlanCode;
        expiresAt: string | null;
        isExpired: boolean;
    } | null;
    subjects?: {
        id: string;
        name: string;
    }[];
    teacherVerificationStatus?: 'PENDING' | 'VERIFIED' | 'REJECTED';
}
export declare const useAuthStore: any;
