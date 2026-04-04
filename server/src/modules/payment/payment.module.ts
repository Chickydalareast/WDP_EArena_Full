import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

import {
  PaymentTransaction,
  PaymentTransactionSchema,
} from './schemas/payment-transaction.schema';
import { PaymentTransactionsRepository } from './payment-transactions.repository';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { WalletsModule } from '../wallets/wallets.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PaymentTransaction.name, schema: PaymentTransactionSchema },
    ]),
    ConfigModule,
    WalletsModule,
  ],
  controllers: [PaymentController],
  providers: [
    PaymentTransactionsRepository,
    PaymentService,
  ],
  exports: [PaymentService],
})
export class PaymentModule {}
