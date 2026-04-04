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
exports.PricingPlanSchema = exports.PricingPlan = exports.PricingPlanCode = void 0;
const mongoose_1 = require("@nestjs/mongoose");
var PricingPlanCode;
(function (PricingPlanCode) {
    PricingPlanCode["FREE"] = "FREE";
    PricingPlanCode["PRO"] = "PRO";
    PricingPlanCode["ENTERPRISE"] = "ENTERPRISE";
})(PricingPlanCode || (exports.PricingPlanCode = PricingPlanCode = {}));
let PricingPlan = class PricingPlan {
    name;
    code;
    priceMonthly;
    priceYearly;
    benefits;
    isActive;
    canCreatePaidCourse;
    isUnlimitedCourses;
    maxCourses;
};
exports.PricingPlan = PricingPlan;
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], PricingPlan.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: PricingPlanCode, unique: true, index: true }),
    __metadata("design:type", String)
], PricingPlan.prototype, "code", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], PricingPlan.prototype, "priceMonthly", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], PricingPlan.prototype, "priceYearly", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], PricingPlan.prototype, "benefits", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true, index: true }),
    __metadata("design:type", Boolean)
], PricingPlan.prototype, "isActive", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: false }),
    __metadata("design:type", Boolean)
], PricingPlan.prototype, "canCreatePaidCourse", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: true }),
    __metadata("design:type", Boolean)
], PricingPlan.prototype, "isUnlimitedCourses", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 0, min: 0 }),
    __metadata("design:type", Number)
], PricingPlan.prototype, "maxCourses", void 0);
exports.PricingPlan = PricingPlan = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'pricing_plans' })
], PricingPlan);
exports.PricingPlanSchema = mongoose_1.SchemaFactory.createForClass(PricingPlan);
//# sourceMappingURL=pricing-plan.schema.js.map