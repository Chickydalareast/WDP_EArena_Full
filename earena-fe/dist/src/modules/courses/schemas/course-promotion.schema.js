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
exports.CoursePromotionSchema = exports.CoursePromotion = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let CoursePromotion = class CoursePromotion {
    courseId;
    teacherId;
    expiresAt;
    amountPaid;
    durationDays;
};
exports.CoursePromotion = CoursePromotion;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Course', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], CoursePromotion.prototype, "courseId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], CoursePromotion.prototype, "teacherId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, index: true }),
    __metadata("design:type", Date)
], CoursePromotion.prototype, "expiresAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], CoursePromotion.prototype, "amountPaid", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 1 }),
    __metadata("design:type", Number)
], CoursePromotion.prototype, "durationDays", void 0);
exports.CoursePromotion = CoursePromotion = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'course_promotions' })
], CoursePromotion);
exports.CoursePromotionSchema = mongoose_1.SchemaFactory.createForClass(CoursePromotion);
exports.CoursePromotionSchema.index({ expiresAt: 1 });
exports.CoursePromotionSchema.index({ courseId: 1, expiresAt: -1 });
//# sourceMappingURL=course-promotion.schema.js.map