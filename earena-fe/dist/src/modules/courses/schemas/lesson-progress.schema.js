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
exports.LessonProgressSchema = exports.LessonProgress = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let LessonProgress = class LessonProgress {
    userId;
    courseId;
    lessonId;
    watchTime;
    lastPosition;
    isCompleted;
    completedAt;
};
exports.LessonProgress = LessonProgress;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], LessonProgress.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Course', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], LessonProgress.prototype, "courseId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Lesson', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], LessonProgress.prototype, "lessonId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 0, min: 0 }),
    __metadata("design:type", Number)
], LessonProgress.prototype, "watchTime", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 0, min: 0 }),
    __metadata("design:type", Number)
], LessonProgress.prototype, "lastPosition", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: false }),
    __metadata("design:type", Boolean)
], LessonProgress.prototype, "isCompleted", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], LessonProgress.prototype, "completedAt", void 0);
exports.LessonProgress = LessonProgress = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'lesson_progress' })
], LessonProgress);
exports.LessonProgressSchema = mongoose_1.SchemaFactory.createForClass(LessonProgress);
exports.LessonProgressSchema.index({ userId: 1, courseId: 1, lessonId: 1 }, { unique: true });
exports.LessonProgressSchema.index({ userId: 1, courseId: 1, isCompleted: 1 });
//# sourceMappingURL=lesson-progress.schema.js.map