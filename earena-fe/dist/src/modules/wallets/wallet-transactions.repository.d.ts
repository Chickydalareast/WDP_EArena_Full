import { Logger } from '@nestjs/common';
import { Connection, Model, Types } from 'mongoose';
import { AbstractRepository } from '../../common/database/abstract.repository';
import { WalletTransaction, WalletTransactionDocument } from './schemas/wallet-transaction.schema';
export declare class WalletTransactionsRepository extends AbstractRepository<WalletTransactionDocument> {
    private readonly transactionModel;
    protected readonly logger: Logger;
    constructor(transactionModel: Model<WalletTransactionDocument>, connection: Connection);
    getMyTransactions(walletId: Types.ObjectId, page: number, limit: number): Promise<{
        data: (WalletTransaction & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        })[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    calculateTotalRevenueByCourse(courseId: string | Types.ObjectId): Promise<number>;
}
