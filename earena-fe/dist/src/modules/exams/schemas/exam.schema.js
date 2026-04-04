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
exports.ExamSchema = exports.Exam = exports.DynamicExamConfig = exports.DynamicFilter = exports.ExamMode = exports.ExamType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const question_schema_1 = require("../../questions/schemas/question.schema");
const exam_matrix_schema_1 = require("./exam-matrix.schema");
var ExamType;
(function (ExamType) {
    ExamType["OFFICIAL"] = "OFFICIAL";
    ExamType["PRACTICE"] = "PRACTICE";
    ExamType["COURSE_QUIZ"] = "COURSE_QUIZ";
})(ExamType || (exports.ExamType = ExamType = {}));
var ExamMode;
(function (ExamMode) {
    ExamMode["STATIC"] = "STATIC";
    ExamMode["DYNAMIC"] = "DYNAMIC";
})(ExamMode || (exports.ExamMode = ExamMode = {}));
let DynamicFilter = class DynamicFilter {
    difficulty;
    count;
};
exports.DynamicFilter = DynamicFilter;
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: question_schema_1.DifficultyLevel, required: true }),
    __metadata("design:type", String)
], DynamicFilter.prototype, "difficulty", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 1 }),
    __metadata("design:type", Number)
], DynamicFilter.prototype, "count", void 0);
exports.DynamicFilter = DynamicFilter = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], DynamicFilter);
const DynamicFilterSchema = mongoose_1.SchemaFactory.createForClass(DynamicFilter);
let DynamicExamConfig = class DynamicExamConfig {
    sourceFolders;
    mixRatio;
    matrixId;
    adHocSections;
};
exports.DynamicExamConfig = DynamicExamConfig;
__decorate([
    (0, mongoose_1.Prop)({
        type: [{ type: mongoose_2.Schema.Types.ObjectId, ref: 'QuestionFolder' }],
        default: [],
    }),
    __metadata("design:type", Array)
], DynamicExamConfig.prototype, "sourceFolders", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [DynamicFilterSchema], default: [] }),
    __metadata("design:type", Array)
], DynamicExamConfig.prototype, "mixRatio", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Schema.Types.ObjectId,
        ref: 'ExamMatrix',
        default: null,
    }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], DynamicExamConfig.prototype, "matrixId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [exam_matrix_schema_1.MatrixSectionSchema], default: [] }),
    __metadata("design:type", Array)
], DynamicExamConfig.prototype, "adHocSections", void 0);
exports.DynamicExamConfig = DynamicExamConfig = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], DynamicExamConfig);
const DynamicExamConfigSchema = mongoose_1.SchemaFactory.createForClass(DynamicExamConfig);
let Exam = class Exam {
    title;
    description;
    teacherId;
    subjectId;
    totalScore;
    isPublished;
    type;
    mode;
    dynamicConfig;
    folderId;
};
exports.Exam = Exam;
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], Exam.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], Exam.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Exam.prototype, "teacherId", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Schema.Types.ObjectId,
        ref: 'Subject',
        required: true,
        index: true,
    }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Exam.prototype, "subjectId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], Exam.prototype, "totalScore", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Exam.prototype, "isPublished", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: ExamType, default: ExamType.PRACTICE }),
    __metadata("design:type", String)
], Exam.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: ExamMode, default: ExamMode.STATIC }),
    __metadata("design:type", String)
], Exam.prototype, "mode", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: DynamicExamConfigSchema, default: null }),
    __metadata("design:type", DynamicExamConfig)
], Exam.prototype, "dynamicConfig", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Schema.Types.ObjectId,
        ref: 'QuestionFolder',
        default: null,
    }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Exam.prototype, "folderId", void 0);
exports.Exam = Exam = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'exams' })
], Exam);
exports.ExamSchema = mongoose_1.SchemaFactory.createForClass(Exam);
exports.ExamSchema.index({ teacherId: 1, subjectId: 1 });
//# sourceMappingURL=exam.schema.js.map