import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type WithdrawalRequestDocument = WithdrawalRequest & Document;

export enum WithdrawalStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
}

@Schema({ _id: false })
export class BankDetail {
  @Prop({ required: true, trim: true })
  bankName: string;

  @Prop({ required: true, trim: true })
  accountNumber: string;

  @Prop({ required: true, trim: true, uppercase: true })
  accountName: string;
}

@Schema({ timestamps: true, collection: 'withdrawal_requests' })
export class WithdrawalRequest {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  })
  teacherId: Types.ObjectId;

  @Prop({ required: true, min: 100000 })
  amount: number;

  @Prop({ type: BankDetail, required: true })
  bankInfo: BankDetail;

  @Prop({
    type: String,
    enum: WithdrawalStatus,
    default: WithdrawalStatus.PENDING,
    index: true,
  })
  status: WithdrawalStatus;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  processedBy?: Types.ObjectId;

  @Prop({ type: Date })
  processedAt?: Date;

  @Prop({ type: String, trim: true })
  rejectionReason?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'WalletTransaction' })
  transactionId?: Types.ObjectId;
}

export const WithdrawalRequestSchema =
  SchemaFactory.createForClass(WithdrawalRequest);

WithdrawalRequestSchema.index({ teacherId: 1, status: 1 });
WithdrawalRequestSchema.index({ status: 1, createdAt: -1 });
