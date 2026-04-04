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
exports.CourseSchema = exports.Course = exports.CourseStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const progression_mode_enum_1 = require("../enums/progression-mode.enum");
var CourseStatus;
(function (CourseStatus) {
    CourseStatus["DRAFT"] = "DRAFT";
    CourseStatus["PENDING_REVIEW"] = "PENDING_REVIEW";
    CourseStatus["PUBLISHED"] = "PUBLISHED";
    CourseStatus["REJECTED"] = "REJECTED";
    CourseStatus["ARCHIVED"] = "ARCHIVED";
})(CourseStatus || (exports.CourseStatus = CourseStatus = {}));
let Course = class Course {
    title;
    slug;
    description;
    price;
    discountPrice;
    teacherId;
    subjectId;
    coverImageId;
    promotionalVideoId;
    status;
    submittedAt;
    rejectionReason;
    benefits;
    requirements;
    averageRating;
    totalReviews;
    progressionMode;
    isStrictExam;
};
exports.Course = Course;
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], Course.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true, index: true, trim: true }),
    __metadata("design:type", String)
], Course.prototype, "slug", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], Course.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], Course.prototype, "price", void 0);
__decorate([
    (0, mongoose_1.Prop)({ min: 0 }),
    __metadata("design:type", Number)
], Course.prototype, "discountPrice", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Course.prototype, "teacherId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Subject', index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Course.prototype, "subjectId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Media' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Course.prototype, "coverImageId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Media' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Course.prototype, "promotionalVideoId", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: CourseStatus,
        default: CourseStatus.DRAFT,
        index: true,
    }),
    __metadata("design:type", String)
], Course.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], Course.prototype, "submittedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, trim: true }),
    __metadata("design:type", String)
], Course.prototype, "rejectionReason", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Course.prototype, "benefits", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Course.prototype, "requirements", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 0, min: 0, max: 5 }),
    __metadata("design:type", Number)
], Course.prototype, "averageRating", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 0, min: 0 }),
    __metadata("design:type", Number)
], Course.prototype, "totalReviews", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: progression_mode_enum_1.ProgressionMode, default: progression_mode_enum_1.ProgressionMode.FREE }),
    __metadata("design:type", String)
], Course.prototype, "progressionMode", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Course.prototype, "isStrictExam", void 0);
exports.Course = Course = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'courses' })
], Course);
exports.CourseSchema = mongoose_1.SchemaFactory.createForClass(Course);
exports.CourseSchema.index({ status: 1, submittedAt: 1 });
exports.CourseSchema.index({ status: 1, teacherId: 1 });
exports.CourseSchema.index({ status: 1, createdAt: -1 });
exports.CourseSchema.index({ status: 1, price: 1, createdAt: -1 });
exports.CourseSchema.index({ status: 1, subjectId: 1, createdAt: -1 });
exports.CourseSchema.index({ status: 1, averageRating: -1, totalReviews: -1 });
//# sourceMappingURL=course.schema.js.map