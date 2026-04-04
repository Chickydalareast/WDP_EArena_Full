"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upgradeSubscriptionSchema = exports.PricingPlanCode = void 0;
const zod_1 = require("zod");
var PricingPlanCode;
(function (PricingPlanCode) {
    PricingPlanCode["FREE"] = "FREE";
    PricingPlanCode["PRO"] = "PRO";
    PricingPlanCode["ENTERPRISE"] = "ENTERPRISE";
})(PricingPlanCode || (exports.PricingPlanCode = PricingPlanCode = {}));
exports.upgradeSubscriptionSchema = zod_1.z.object({
    planId: zod_1.z.string().min(1, 'Vui lòng chọn gói cước hợp lệ'),
    billingCycle: zod_1.z.enum(['MONTHLY', 'YEARLY']),
});
//# sourceMappingURL=subscription.schema.js.map