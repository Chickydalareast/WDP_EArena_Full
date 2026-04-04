import { Logger } from '@nestjs/common';
import { Connection, Model } from 'mongoose';
import { AbstractRepository } from '../../../common/database/abstract.repository';
import { SubscriptionTransactionDocument } from '../schemas/subscription-transaction.schema';
export declare class SubscriptionTransactionsRepository extends AbstractRepository<SubscriptionTransactionDocument> {
    protected readonly logger: Logger;
    constructor(model: Model<SubscriptionTransactionDocument>, connection: Connection);
}
