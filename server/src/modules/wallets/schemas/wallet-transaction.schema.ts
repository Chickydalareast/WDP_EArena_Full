import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type WalletTransactionDocument = WalletTransaction & Document;

export enum TransactionType {
  DEPOSIT = 'DEPOSIT',       // Nạp tiền vào
  PAYMENT = 'PAYMENT',       // Trừ tiền mua Khóa học/Đề thi
  REVENUE = 'REVENUE',       // Tiền giáo viên nhận được khi có người mua
  REFUND = 'REFUND',         // Hoàn tiền
  WITHDRAWAL = 'WITHDRAWAL', // Giáo viên rút tiền ra VNĐ
}

export enum ReferenceType {
  COURSE = 'COURSE',
  EXAM = 'EXAM',
  ORDER = 'ORDER', // Trỏ tới bảng thanh toán VNPay/Stripe (làm sau)
}

@Schema({ timestamps: { createdAt: true, updatedAt: false }, collection: 'wallet_transactions' })
export class WalletTransaction {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Wallet', required: true, index: true })
  walletId: Types.ObjectId;

  @Prop({ type: String, enum: TransactionType, required: true, index: true })
  type: TransactionType;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true, min: 0 })
  postBalance: number;

  @Prop({ trim: true })
  description: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, index: true })
  referenceId?: Types.ObjectId;

  @Prop({ type: String, enum: ReferenceType })
  referenceType?: ReferenceType;
}

export const WalletTransactionSchema = SchemaFactory.createForClass(WalletTransaction);