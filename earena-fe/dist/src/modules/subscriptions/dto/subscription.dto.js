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
exports.UpgradePlanDto = void 0;
const class_validator_1 = require("class-validator");
const subscription_transaction_schema_1 = require("../schemas/subscription-transaction.schema");
class UpgradePlanDto {
    planId;
    billingCycle;
}
exports.UpgradePlanDto = UpgradePlanDto;
__decorate([
    (0, class_validator_1.IsMongoId)({ message: 'Mã gói cước không hợp lệ.' }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UpgradePlanDto.prototype, "planId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(subscription_transaction_schema_1.BillingCycle, {
        message: 'Chu kỳ thanh toán phải là MONTHLY hoặc YEARLY.',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UpgradePlanDto.prototype, "billingCycle", void 0);
//# sourceMappingURL=subscription.dto.js.map