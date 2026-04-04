"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const config_1 = require("@nestjs/config");
const wallet_schema_1 = require("./schemas/wallet.schema");
const wallet_transaction_schema_1 = require("./schemas/wallet-transaction.schema");
const withdrawal_request_schema_1 = require("./schemas/withdrawal-request.schema");
const wallets_repository_1 = require("./wallets.repository");
const wallet_transactions_repository_1 = require("./wallet-transactions.repository");
const withdrawal_requests_repository_1 = require("./withdrawal-requests.repository");
const wallets_service_1 = require("./wallets.service");
const wallets_controller_1 = require("./wallets.controller");
const users_module_1 = require("../users/users.module");
let WalletsModule = class WalletsModule {
};
exports.WalletsModule = WalletsModule;
exports.WalletsModule = WalletsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: wallet_schema_1.Wallet.name, schema: wallet_schema_1.WalletSchema },
                { name: wallet_transaction_schema_1.WalletTransaction.name, schema: wallet_transaction_schema_1.WalletTransactionSchema },
                { name: withdrawal_request_schema_1.WithdrawalRequest.name, schema: withdrawal_request_schema_1.WithdrawalRequestSchema },
            ]),
            config_1.ConfigModule,
            users_module_1.UsersModule,
        ],
        controllers: [wallets_controller_1.WalletsController],
        providers: [
            wallets_repository_1.WalletsRepository,
            wallet_transactions_repository_1.WalletTransactionsRepository,
            wallets_service_1.WalletsService,
            withdrawal_requests_repository_1.WithdrawalRequestsRepository,
        ],
        exports: [wallets_service_1.WalletsService, wallet_transactions_repository_1.WalletTransactionsRepository],
    })
], WalletsModule);
//# sourceMappingURL=wallets.module.js.map