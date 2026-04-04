import { Logger } from '@nestjs/common';
import { Connection, Model, Types } from 'mongoose';
import { AbstractRepository } from '../../common/database/abstract.repository';
import { WalletDocument } from './schemas/wallet.schema';
export declare class WalletsRepository extends AbstractRepository<WalletDocument> {
    private readonly walletModel;
    protected readonly logger: Logger;
    constructor(walletModel: Model<WalletDocument>, connection: Connection);
    getOrCreateWallet(userId: string | Types.ObjectId): Promise<WalletDocument>;
    atomicDeduct(walletId: Types.ObjectId, amount: number): Promise<WalletDocument | null>;
    atomicAdd(walletId: Types.ObjectId, amount: number): Promise<WalletDocument | null>;
}
