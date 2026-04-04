"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionTransactionSchema = exports.SubscriptionTransaction = exports.TransactionStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["PENDING"] = "PENDING";
    TransactionStatus["PAID"] = "PAID";
    TransactionStatus["REFUNDED"] = "REFUNDED";
})(TransactionStatus || (exports.TransactionStatus = TransactionStatus = {}));
let SubscriptionTransaction = class SubscriptionTransaction {
    userId;
    planId;
    amount;
    currency;
    status;
};
exports.SubscriptionTransaction = SubscriptionTransaction;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], SubscriptionTransaction.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'PricingPlan', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], SubscriptionTransaction.prototype, "planId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], SubscriptionTransaction.prototype, "amount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'VND' }),
    __metadata("design:type", String)
], SubscriptionTransaction.prototype, "currency", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: TransactionStatus, default: TransactionStatus.PAID, index: true }),
    __metadata("design:type", String)
], SubscriptionTransaction.prototype, "status", void 0);
exports.SubscriptionTransaction = SubscriptionTransaction = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'subscription_transactions' })
], SubscriptionTransaction);
exports.SubscriptionTransactionSchema = mongoose_1.SchemaFactory.createForClass(SubscriptionTransaction);
//# sourceMappingURL=subscription-transaction.schema.js.map