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
exports.ExamPaperSchema = exports.ExamPaper = exports.PaperAnswerKey = exports.PaperQuestion = exports.PaperAnswerOption = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const question_schema_1 = require("../../questions/schemas/question.schema");
let PaperAnswerOption = class PaperAnswerOption {
    id;
    content;
};
exports.PaperAnswerOption = PaperAnswerOption;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], PaperAnswerOption.prototype, "id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], PaperAnswerOption.prototype, "content", void 0);
exports.PaperAnswerOption = PaperAnswerOption = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], PaperAnswerOption);
const PaperAnswerOptionSchema = mongoose_1.SchemaFactory.createForClass(PaperAnswerOption);
let PaperQuestion = class PaperQuestion {
    originalQuestionId;
    type;
    parentPassageId;
    orderIndex;
    explanation;
    content;
    difficultyLevel;
    answers;
    attachedMedia;
    points;
};
exports.PaperQuestion = PaperQuestion;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], PaperQuestion.prototype, "originalQuestionId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: question_schema_1.QuestionType, required: true }),
    __metadata("design:type", String)
], PaperQuestion.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], PaperQuestion.prototype, "parentPassageId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], PaperQuestion.prototype, "orderIndex", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: null }),
    __metadata("design:type", String)
], PaperQuestion.prototype, "explanation", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], PaperQuestion.prototype, "content", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: question_schema_1.DifficultyLevel, required: true }),
    __metadata("design:type", String)
], PaperQuestion.prototype, "difficultyLevel", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [PaperAnswerOptionSchema], default: [] }),
    __metadata("design:type", Array)
], PaperQuestion.prototype, "answers", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [{ type: mongoose_2.Schema.Types.ObjectId, ref: 'Media' }],
        default: [],
    }),
    __metadata("design:type", Array)
], PaperQuestion.prototype, "attachedMedia", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: null }),
    __metadata("design:type", Object)
], PaperQuestion.prototype, "points", void 0);
exports.PaperQuestion = PaperQuestion = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], PaperQuestion);
const PaperQuestionSchema = mongoose_1.SchemaFactory.createForClass(PaperQuestion);
let PaperAnswerKey = class PaperAnswerKey {
    originalQuestionId;
    correctAnswerId;
};
exports.PaperAnswerKey = PaperAnswerKey;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], PaperAnswerKey.prototype, "originalQuestionId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], PaperAnswerKey.prototype, "correctAnswerId", void 0);
exports.PaperAnswerKey = PaperAnswerKey = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], PaperAnswerKey);
const PaperAnswerKeySchema = mongoose_1.SchemaFactory.createForClass(PaperAnswerKey);
let ExamPaper = class ExamPaper {
    examId;
    submissionId;
    questions;
    answerKeys;
};
exports.ExamPaper = ExamPaper;
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Schema.Types.ObjectId,
        ref: 'Exam',
        required: true,
        index: true,
    }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ExamPaper.prototype, "examId", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Schema.Types.ObjectId,
        ref: 'ExamSubmission',
        default: null,
        index: true,
    }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ExamPaper.prototype, "submissionId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [PaperQuestionSchema], required: true }),
    __metadata("design:type", Array)
], ExamPaper.prototype, "questions", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [PaperAnswerKeySchema], select: false, default: [] }),
    __metadata("design:type", Array)
], ExamPaper.prototype, "answerKeys", void 0);
exports.ExamPaper = ExamPaper = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'exam_papers' })
], ExamPaper);
exports.ExamPaperSchema = mongoose_1.SchemaFactory.createForClass(ExamPaper);
exports.ExamPaperSchema.index({ examId: 1, submissionId: 1 });
//# sourceMappingURL=exam-paper.schema.js.map