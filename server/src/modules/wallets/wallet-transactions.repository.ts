import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { AbstractRepository } from '../../common/database/abstract.repository';
import { WalletTransaction, WalletTransactionDocument } from './schemas/wallet-transaction.schema';

@Injectable()
export class WalletTransactionsRepository extends AbstractRepository<WalletTransactionDocument> {
  protected readonly logger = new Logger(WalletTransactionsRepository.name);

  constructor(
    @InjectModel(WalletTransaction.name) private readonly transactionModel: Model<WalletTransactionDocument>,
    @InjectConnection() connection: Connection,
  ) {
    super(transactionModel, connection);
  }

  async getMyTransactions(walletId: Types.ObjectId, page: number, limit: number) {
    const skip = (page - 1) * limit;
    
    // [CTO UPGRADE]: Query song song lấy Data và Total đếm tổng
    const [data, total] = await Promise.all([
      this.transactionModel
        .find({ walletId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.transactionModel.countDocuments({ walletId })
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
  }
}