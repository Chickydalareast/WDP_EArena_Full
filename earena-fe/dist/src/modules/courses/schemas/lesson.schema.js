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
exports.LessonSchema = exports.Lesson = exports.ExamRuleConfig = exports.ShowResultMode = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var ShowResultMode;
(function (ShowResultMode) {
    ShowResultMode["IMMEDIATELY"] = "IMMEDIATELY";
    ShowResultMode["AFTER_END_TIME"] = "AFTER_END_TIME";
    ShowResultMode["NEVER"] = "NEVER";
})(ShowResultMode || (exports.ShowResultMode = ShowResultMode = {}));
let ExamRuleConfig = class ExamRuleConfig {
    timeLimit;
    maxAttempts;
    passPercentage;
    showResultMode;
};
exports.ExamRuleConfig = ExamRuleConfig;
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], ExamRuleConfig.prototype, "timeLimit", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 1, default: 1 }),
    __metadata("design:type", Number)
], ExamRuleConfig.prototype, "maxAttempts", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0, max: 100, default: 50 }),
    __metadata("design:type", Number)
], ExamRuleConfig.prototype, "passPercentage", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: ShowResultMode,
        default: ShowResultMode.IMMEDIATELY,
    }),
    __metadata("design:type", String)
], ExamRuleConfig.prototype, "showResultMode", void 0);
exports.ExamRuleConfig = ExamRuleConfig = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], ExamRuleConfig);
const ExamRuleConfigSchema = mongoose_1.SchemaFactory.createForClass(ExamRuleConfig);
let Lesson = class Lesson {
    courseId;
    sectionId;
    title;
    order;
    isFreePreview;
    primaryVideoId;
    attachments;
    content;
    examId;
    examRules;
};
exports.Lesson = Lesson;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Course', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Lesson.prototype, "courseId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Section', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Lesson.prototype, "sectionId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], Lesson.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 0 }),
    __metadata("design:type", Number)
], Lesson.prototype, "order", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Lesson.prototype, "isFreePreview", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Media' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Lesson.prototype, "primaryVideoId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: mongoose_2.Types.ObjectId, ref: 'Media' }], default: [] }),
    __metadata("design:type", Array)
], Lesson.prototype, "attachments", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, default: '' }),
    __metadata("design:type", String)
], Lesson.prototype, "content", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Exam', index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Lesson.prototype, "examId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: ExamRuleConfigSchema, default: null }),
    __metadata("design:type", ExamRuleConfig)
], Lesson.prototype, "examRules", void 0);
exports.Lesson = Lesson = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'course_lessons' })
], Lesson);
exports.LessonSchema = mongoose_1.SchemaFactory.createForClass(Lesson);
exports.LessonSchema.index({ sectionId: 1, order: 1 }, { unique: true });
//# sourceMappingURL=lesson.schema.js.map