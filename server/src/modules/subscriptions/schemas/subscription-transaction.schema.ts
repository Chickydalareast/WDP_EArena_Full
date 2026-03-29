import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type SubscriptionTransactionDocument = SubscriptionTransaction & Document;

export enum TransactionStatus {
    PENDING = 'PENDING',
    PAID = 'PAID',
    REFUNDED = 'REFUNDED',
}

export enum BillingCycle {
    MONTHLY = 'MONTHLY',
    YEARLY = 'YEARLY',
}

@Schema({ timestamps: true, collection: 'subscription_transactions' })
export class SubscriptionTransaction {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
    userId: Types.ObjectId;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'PricingPlan', required: true, index: true })
    planId: Types.ObjectId;

    @Prop({ type: String, enum: BillingCycle, required: true })
    billingCycle: BillingCycle;

    @Prop({ required: true, min: 0 })
    baseAmount: number;

    @Prop({ required: true, default: 0, min: 0 })
    proratedDiscount: number;

    @Prop({ required: true, min: 0 })
    finalAmount: number;

    @Prop({ default: 'VND' })
    currency: string;

    @Prop({ required: true, enum: TransactionStatus, default: TransactionStatus.PAID, index: true })
    status: TransactionStatus;
}

export const SubscriptionTransactionSchema = SchemaFactory.createForClass(SubscriptionTransaction);