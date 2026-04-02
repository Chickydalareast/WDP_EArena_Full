import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, PipelineStage, Types } from 'mongoose';
import { AbstractRepository } from '../../common/database/abstract.repository';
import { ReferenceType, TransactionType, WalletTransaction, WalletTransactionDocument } from './schemas/wallet-transaction.schema';

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

  async calculateTotalRevenueByCourse(courseId: string | Types.ObjectId): Promise<number> {
    const pipeline: PipelineStage[] = [
      {
        $match: {
          referenceId: new Types.ObjectId(courseId.toString()),
          referenceType: ReferenceType.COURSE,
          type: TransactionType.REVENUE
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' }
        }
      }
    ];

    const result = await this.transactionModel.aggregate(pipeline).exec();
    return result.length > 0 ? result[0].totalRevenue : 0;
  }
}