import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PricingPlan, PricingPlanSchema } from './schemas/pricing-plan.schema';
import { SubscriptionTransaction, SubscriptionTransactionSchema } from './schemas/subscription-transaction.schema';

import { PricingPlansRepository } from './repositories/pricing-plans.repository';
import { SubscriptionTransactionsRepository } from './repositories/subscription-transactions.repository';

import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';

import { UsersModule } from '../users/users.module';
import { WalletsModule } from '../wallets/wallets.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: PricingPlan.name, schema: PricingPlanSchema },
            { name: SubscriptionTransaction.name, schema: SubscriptionTransactionSchema },
        ]),
        UsersModule,
        WalletsModule,
    ],
    controllers: [SubscriptionsController],
    providers: [
        PricingPlansRepository,
        SubscriptionTransactionsRepository,
        SubscriptionsService,
    ],
    exports: [
        PricingPlansRepository,
        SubscriptionTransactionsRepository,
    ],
})
export class SubscriptionsModule { }