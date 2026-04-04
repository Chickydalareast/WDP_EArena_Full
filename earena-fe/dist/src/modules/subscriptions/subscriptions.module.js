"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const pricing_plan_schema_1 = require("./schemas/pricing-plan.schema");
const subscription_transaction_schema_1 = require("./schemas/subscription-transaction.schema");
const pricing_plans_repository_1 = require("./repositories/pricing-plans.repository");
const subscription_transactions_repository_1 = require("./repositories/subscription-transactions.repository");
const subscriptions_service_1 = require("./subscriptions.service");
const subscriptions_controller_1 = require("./subscriptions.controller");
const users_module_1 = require("../users/users.module");
const wallets_module_1 = require("../wallets/wallets.module");
let SubscriptionsModule = class SubscriptionsModule {
};
exports.SubscriptionsModule = SubscriptionsModule;
exports.SubscriptionsModule = SubscriptionsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: pricing_plan_schema_1.PricingPlan.name, schema: pricing_plan_schema_1.PricingPlanSchema },
                {
                    name: subscription_transaction_schema_1.SubscriptionTransaction.name,
                    schema: subscription_transaction_schema_1.SubscriptionTransactionSchema,
                },
            ]),
            users_module_1.UsersModule,
            wallets_module_1.WalletsModule,
        ],
        controllers: [subscriptions_controller_1.SubscriptionsController],
        providers: [
            pricing_plans_repository_1.PricingPlansRepository,
            subscription_transactions_repository_1.SubscriptionTransactionsRepository,
            subscriptions_service_1.SubscriptionsService,
        ],
        exports: [pricing_plans_repository_1.PricingPlansRepository, subscription_transactions_repository_1.SubscriptionTransactionsRepository],
    })
], SubscriptionsModule);
//# sourceMappingURL=subscriptions.module.js.map