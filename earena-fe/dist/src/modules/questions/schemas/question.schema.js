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
exports.QuestionSchema = exports.Question = exports.AnswerOption = exports.QuestionType = exports.DifficultyLevel = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var DifficultyLevel;
(function (DifficultyLevel) {
    DifficultyLevel["NB"] = "NB";
    DifficultyLevel["TH"] = "TH";
    DifficultyLevel["VD"] = "VD";
    DifficultyLevel["VDC"] = "VDC";
    DifficultyLevel["UNKNOWN"] = "UNKNOWN";
})(DifficultyLevel || (exports.DifficultyLevel = DifficultyLevel = {}));
var QuestionType;
(function (QuestionType) {
    QuestionType["MULTIPLE_CHOICE"] = "MULTIPLE_CHOICE";
    QuestionType["PASSAGE"] = "PASSAGE";
    QuestionType["FILL_BLANK"] = "FILL_BLANK";
    QuestionType["TRUE_FALSE"] = "TRUE_FALSE";
})(QuestionType || (exports.QuestionType = QuestionType = {}));
let AnswerOption = class AnswerOption {
    id;
    content;
    isCorrect;
};
exports.AnswerOption = AnswerOption;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], AnswerOption.prototype, "id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], AnswerOption.prototype, "content", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Boolean)
], AnswerOption.prototype, "isCorrect", void 0);
exports.AnswerOption = AnswerOption = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], AnswerOption);
const AnswerOptionSchema = mongoose_1.SchemaFactory.createForClass(AnswerOption);
let Question = class Question {
    ownerId;
    folderId;
    topicId;
    parentPassageId;
    type;
    content;
    explanation;
    orderIndex;
    answers;
    attachedMedia;
    difficultyLevel;
    tags;
    isDraft;
    isArchived;
};
exports.Question = Question;
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Question.prototype, "ownerId", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Schema.Types.ObjectId,
        ref: 'QuestionFolder',
        required: true,
        index: true,
    }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Question.prototype, "folderId", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Schema.Types.ObjectId,
        ref: 'KnowledgeTopic',
        default: null,
    }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Question.prototype, "topicId", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Schema.Types.ObjectId,
        ref: 'Question',
        default: null,
        index: true,
    }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Question.prototype, "parentPassageId", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: QuestionType,
        default: QuestionType.MULTIPLE_CHOICE,
        index: true,
    }),
    __metadata("design:type", String)
], Question.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Question.prototype, "content", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: null }),
    __metadata("design:type", String)
], Question.prototype, "explanation", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], Question.prototype, "orderIndex", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [AnswerOptionSchema], default: [] }),
    __metadata("design:type", Array)
], Question.prototype, "answers", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [{ type: mongoose_2.Schema.Types.ObjectId, ref: 'Media' }],
        default: [],
    }),
    __metadata("design:type", Array)
], Question.prototype, "attachedMedia", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: DifficultyLevel,
        default: DifficultyLevel.UNKNOWN,
        index: true,
    }),
    __metadata("design:type", String)
], Question.prototype, "difficultyLevel", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [], index: true }),
    __metadata("design:type", Array)
], Question.prototype, "tags", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true, index: true }),
    __metadata("design:type", Boolean)
], Question.prototype, "isDraft", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Question.prototype, "isArchived", void 0);
exports.Question = Question = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'questions' })
], Question);
exports.QuestionSchema = mongoose_1.SchemaFactory.createForClass(Question);
exports.QuestionSchema.index({ folderId: 1, type: 1, isDraft: 1 });
exports.QuestionSchema.index({ parentPassageId: 1, orderIndex: 1 });
//# sourceMappingURL=question.schema.js.map