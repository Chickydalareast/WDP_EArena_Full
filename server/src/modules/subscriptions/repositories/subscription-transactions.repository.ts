import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { AbstractRepository } from '../../../common/database/abstract.repository';
import { SubscriptionTransaction, SubscriptionTransactionDocument } from '../schemas/subscription-transaction.schema';

@Injectable()
export class SubscriptionTransactionsRepository extends AbstractRepository<SubscriptionTransactionDocument> {
    protected readonly logger = new Logger(SubscriptionTransactionsRepository.name);

    constructor(
        @InjectModel(SubscriptionTransaction.name) model: Model<SubscriptionTransactionDocument>,
        @InjectConnection() connection: Connection,
    ) {
        super(model, connection);
    }
}