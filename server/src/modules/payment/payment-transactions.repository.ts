import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  PaymentTransaction,
  PaymentTransactionDocument,
  PaymentStatus,
} from './schemas/payment-transaction.schema';

@Injectable()
export class PaymentTransactionsRepository {
  constructor(
    @InjectModel(PaymentTransaction.name)
    private readonly paymentTransactionModel: Model<PaymentTransactionDocument>,
  ) {}

  async create(
    data: Partial<PaymentTransaction>,
  ): Promise<PaymentTransactionDocument> {
    const payment = new this.paymentTransactionModel(data);
    return payment.save();
  }

  async findByOrderCode(
    orderCode: number,
  ): Promise<PaymentTransactionDocument | null> {
    return this.paymentTransactionModel.findOne({ orderCode }).exec();
  }

  async findById(id: string): Promise<PaymentTransactionDocument | null> {
    return this.paymentTransactionModel.findById(id).exec();
  }

  async updateStatus(
    orderCode: number,
    status: PaymentStatus,
    additionalData?: Partial<PaymentTransaction>,
  ): Promise<PaymentTransactionDocument | null> {
    const updateData: Partial<PaymentTransaction> = { status };

    if (status === PaymentStatus.SUCCESS) {
      updateData.paidAt = new Date();
    } else if (status === PaymentStatus.CANCELLED) {
      updateData.cancelledAt = new Date();
    }

    if (additionalData) {
      Object.assign(updateData, additionalData);
    }

    return this.paymentTransactionModel
      .findOneAndUpdate({ orderCode }, updateData, { new: true })
      .exec();
  }
}
