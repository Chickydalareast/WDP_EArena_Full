import { Logger } from '@nestjs/common';
import { Connection, Model } from 'mongoose';
import { AbstractRepository } from '../../common/database/abstract.repository';
import { WithdrawalRequest, WithdrawalRequestDocument } from './schemas/withdrawal-request.schema';
export declare class WithdrawalRequestsRepository extends AbstractRepository<WithdrawalRequestDocument> {
    private readonly requestModel;
    protected readonly logger: Logger;
    constructor(requestModel: Model<WithdrawalRequestDocument>, connection: Connection);
    getAdminWithdrawalRequests(status: string | undefined, page: number, limit: number): Promise<{
        items: (WithdrawalRequest & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
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
}
