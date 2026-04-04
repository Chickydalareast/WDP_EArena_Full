import { Types } from 'mongoose';
import { ReferenceType } from '../schemas/wallet-transaction.schema';
export interface MockDepositPayload {
    userId: string;
    amount: number;
}
export interface ProcessPaymentPayload {
    userId: string;
    amount: number;
    referenceId: string;
    referenceType: ReferenceType;
    description: string;
}
export interface GetTransactionsPayload {
    userId: string;
    page: number;
    limit: number;
}
export interface ProcessSplitPaymentPayload {
    buyerId: string;
    sellerId: string;
    amount: number;
    referenceId: string | Types.ObjectId;
    referenceType: ReferenceType;
    description: string;
}
export interface ProcessSubscriptionPaymentPayload {
    teacherId: string;
    amount: number;
    planId: string | Types.ObjectId;
    description: string;
}
