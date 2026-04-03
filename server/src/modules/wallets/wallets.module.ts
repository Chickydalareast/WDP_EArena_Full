import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

import { Wallet, WalletSchema } from './schemas/wallet.schema';
import {
  WalletTransaction,
  WalletTransactionSchema,
} from './schemas/wallet-transaction.schema';
import {
  WithdrawalRequest,
  WithdrawalRequestSchema,
} from './schemas/withdrawal-request.schema';

import { WalletsRepository } from './wallets.repository';
import { WalletTransactionsRepository } from './wallet-transactions.repository';
import { WithdrawalRequestsRepository } from './withdrawal-requests.repository';

import { WalletsService } from './wallets.service';
import { WalletsController } from './wallets.controller';

import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Wallet.name, schema: WalletSchema },
      { name: WalletTransaction.name, schema: WalletTransactionSchema },
      { name: WithdrawalRequest.name, schema: WithdrawalRequestSchema },
    ]),
    ConfigModule,
    UsersModule,
  ],
  controllers: [WalletsController],
  providers: [
    WalletsRepository,
    WalletTransactionsRepository,
    WalletsService,
    WithdrawalRequestsRepository,
  ],
  exports: [WalletsService, WalletTransactionsRepository],
})
export class WalletsModule {}
