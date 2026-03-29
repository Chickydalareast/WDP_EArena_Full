import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { AbstractRepository } from '../../common/database/abstract.repository';
import { Wallet, WalletDocument } from './schemas/wallet.schema';

@Injectable()
export class WalletsRepository extends AbstractRepository<WalletDocument> {
  protected readonly logger = new Logger(WalletsRepository.name);

  constructor(
    @InjectModel(Wallet.name) private readonly walletModel: Model<WalletDocument>,
    @InjectConnection() connection: Connection,
  ) {
    super(walletModel, connection);
  }

  async getOrCreateWallet(userId: string | Types.ObjectId): Promise<WalletDocument> {
    const wallet = await this.walletModel.findOne({ userId: new Types.ObjectId(userId) }).lean().exec();
    if (wallet) return wallet as WalletDocument;

    return this.createDocument({
      userId: new Types.ObjectId(userId),
      balance: 0,
      status: 'ACTIVE',
    });
  }

  async atomicDeduct(walletId: Types.ObjectId, amount: number): Promise<WalletDocument | null> {
    return this.walletModel.findOneAndUpdate(
      { 
        _id: walletId, 
        balance: { $gte: amount }
      },
      { 
        $inc: { balance: -amount }
      },
      { 
        new: true, 
        lean: true, 
        session: this.currentSession // [BẢO CHỨNG ACID]
      }
    ).exec() as Promise<WalletDocument | null>;
  }

  async atomicAdd(walletId: Types.ObjectId, amount: number): Promise<WalletDocument | null> {
    return this.walletModel.findOneAndUpdate(
      { _id: walletId },
      { $inc: { balance: amount } },
      { 
        new: true, 
        lean: true, 
        session: this.currentSession // [CTO FIX]: Khóa chặt Transaction
      }
    ).exec() as Promise<WalletDocument | null>;
  }
}