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
exports.WithdrawalRequestSchema = exports.WithdrawalRequest = exports.BankDetail = exports.WithdrawalStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var WithdrawalStatus;
(function (WithdrawalStatus) {
    WithdrawalStatus["PENDING"] = "PENDING";
    WithdrawalStatus["PROCESSING"] = "PROCESSING";
    WithdrawalStatus["COMPLETED"] = "COMPLETED";
    WithdrawalStatus["REJECTED"] = "REJECTED";
})(WithdrawalStatus || (exports.WithdrawalStatus = WithdrawalStatus = {}));
let BankDetail = class BankDetail {
    bankName;
    accountNumber;
    accountName;
};
exports.BankDetail = BankDetail;
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], BankDetail.prototype, "bankName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], BankDetail.prototype, "accountNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true, uppercase: true }),
    __metadata("design:type", String)
], BankDetail.prototype, "accountName", void 0);
exports.BankDetail = BankDetail = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], BankDetail);
let WithdrawalRequest = class WithdrawalRequest {
    teacherId;
    amount;
    bankInfo;
    status;
    processedBy;
    processedAt;
    rejectionReason;
    transactionId;
};
exports.WithdrawalRequest = WithdrawalRequest;
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], WithdrawalRequest.prototype, "teacherId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 100000 }),
    __metadata("design:type", Number)
], WithdrawalRequest.prototype, "amount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: BankDetail, required: true }),
    __metadata("design:type", BankDetail)
], WithdrawalRequest.prototype, "bankInfo", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: WithdrawalStatus,
        default: WithdrawalStatus.PENDING,
        index: true,
    }),
    __metadata("design:type", String)
], WithdrawalRequest.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], WithdrawalRequest.prototype, "processedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], WithdrawalRequest.prototype, "processedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, trim: true }),
    __metadata("design:type", String)
], WithdrawalRequest.prototype, "rejectionReason", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'WalletTransaction' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], WithdrawalRequest.prototype, "transactionId", void 0);
exports.WithdrawalRequest = WithdrawalRequest = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'withdrawal_requests' })
], WithdrawalRequest);
exports.WithdrawalRequestSchema = mongoose_1.SchemaFactory.createForClass(WithdrawalRequest);
exports.WithdrawalRequestSchema.index({ teacherId: 1, status: 1 });
exports.WithdrawalRequestSchema.index({ status: 1, createdAt: -1 });
//# sourceMappingURL=withdrawal-request.schema.js.map