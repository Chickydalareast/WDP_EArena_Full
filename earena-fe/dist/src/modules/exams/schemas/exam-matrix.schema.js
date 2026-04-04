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
exports.ExamMatrixSchema = exports.ExamMatrix = exports.MatrixSectionSchema = exports.MatrixSection = exports.MatrixRuleSchema = exports.MatrixRule = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const question_schema_1 = require("../../questions/schemas/question.schema");
let MatrixRule = class MatrixRule {
    folderIds;
    topicIds;
    difficulties;
    tags;
    limit;
};
exports.MatrixRule = MatrixRule;
__decorate([
    (0, mongoose_1.Prop)({
        type: [{ type: mongoose_2.Schema.Types.ObjectId, ref: 'QuestionFolder' }],
        default: [],
    }),
    __metadata("design:type", Array)
], MatrixRule.prototype, "folderIds", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [{ type: mongoose_2.Schema.Types.ObjectId, ref: 'KnowledgeTopic' }],
        default: [],
    }),
    __metadata("design:type", Array)
], MatrixRule.prototype, "topicIds", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], enum: question_schema_1.DifficultyLevel, default: [] }),
    __metadata("design:type", Array)
], MatrixRule.prototype, "difficulties", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], MatrixRule.prototype, "tags", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 1 }),
    __metadata("design:type", Number)
], MatrixRule.prototype, "limit", void 0);
exports.MatrixRule = MatrixRule = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], MatrixRule);
exports.MatrixRuleSchema = mongoose_1.SchemaFactory.createForClass(MatrixRule);
let MatrixSection = class MatrixSection {
    name;
    orderIndex;
    rules;
};
exports.MatrixSection = MatrixSection;
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], MatrixSection.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], MatrixSection.prototype, "orderIndex", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [exports.MatrixRuleSchema], required: true }),
    __metadata("design:type", Array)
], MatrixSection.prototype, "rules", void 0);
exports.MatrixSection = MatrixSection = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], MatrixSection);
exports.MatrixSectionSchema = mongoose_1.SchemaFactory.createForClass(MatrixSection);
let ExamMatrix = class ExamMatrix {
    title;
    description;
    teacherId;
    subjectId;
    sections;
};
exports.ExamMatrix = ExamMatrix;
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], ExamMatrix.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, default: '' }),
    __metadata("design:type", String)
], ExamMatrix.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ExamMatrix.prototype, "teacherId", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Schema.Types.ObjectId,
        ref: 'Subject',
        required: true,
        index: true,
    }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ExamMatrix.prototype, "subjectId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [exports.MatrixSectionSchema], required: true }),
    __metadata("design:type", Array)
], ExamMatrix.prototype, "sections", void 0);
exports.ExamMatrix = ExamMatrix = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'exam_matrices' })
], ExamMatrix);
exports.ExamMatrixSchema = mongoose_1.SchemaFactory.createForClass(ExamMatrix);
exports.ExamMatrixSchema.index({ teacherId: 1, subjectId: 1 });
//# sourceMappingURL=exam-matrix.schema.js.map