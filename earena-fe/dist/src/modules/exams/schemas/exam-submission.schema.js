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
exports.ExamSubmissionSchema = exports.ExamSubmission = exports.StudentAnswer = exports.SubmissionStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var SubmissionStatus;
(function (SubmissionStatus) {
    SubmissionStatus["IN_PROGRESS"] = "IN_PROGRESS";
    SubmissionStatus["COMPLETED"] = "COMPLETED";
    SubmissionStatus["ABANDONED"] = "ABANDONED";
})(SubmissionStatus || (exports.SubmissionStatus = SubmissionStatus = {}));
let StudentAnswer = class StudentAnswer {
    questionId;
    selectedAnswerId;
    isCorrect;
};
exports.StudentAnswer = StudentAnswer;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], StudentAnswer.prototype, "questionId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: null }),
    __metadata("design:type", Object)
], StudentAnswer.prototype, "selectedAnswerId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: null }),
    __metadata("design:type", Boolean)
], StudentAnswer.prototype, "isCorrect", void 0);
exports.StudentAnswer = StudentAnswer = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], StudentAnswer);
const StudentAnswerSchema = mongoose_1.SchemaFactory.createForClass(StudentAnswer);
let ExamSubmission = class ExamSubmission {
    studentId;
    courseId;
    lessonId;
    examId;
    examPaperId;
    attemptNumber;
    answers;
    score;
    status;
    submittedAt;
};
exports.ExamSubmission = ExamSubmission;
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ExamSubmission.prototype, "studentId", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
        index: true,
    }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ExamSubmission.prototype, "courseId", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Schema.Types.ObjectId,
        ref: 'Lesson',
        required: true,
        index: true,
    }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ExamSubmission.prototype, "lessonId", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Schema.Types.ObjectId,
        ref: 'Exam',
        required: true,
        index: true,
    }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ExamSubmission.prototype, "examId", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Schema.Types.ObjectId,
        ref: 'ExamPaper',
        required: true,
    }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ExamSubmission.prototype, "examPaperId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 1, default: 1 }),
    __metadata("design:type", Number)
], ExamSubmission.prototype, "attemptNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [StudentAnswerSchema], default: [] }),
    __metadata("design:type", Array)
], ExamSubmission.prototype, "answers", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: null }),
    __metadata("design:type", Number)
], ExamSubmission.prototype, "score", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: SubmissionStatus,
        default: SubmissionStatus.IN_PROGRESS,
        index: true,
    }),
    __metadata("design:type", String)
], ExamSubmission.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null }),
    __metadata("design:type", Date)
], ExamSubmission.prototype, "submittedAt", void 0);
exports.ExamSubmission = ExamSubmission = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'exam_submissions' })
], ExamSubmission);
exports.ExamSubmissionSchema = mongoose_1.SchemaFactory.createForClass(ExamSubmission);
exports.ExamSubmissionSchema.index({ courseId: 1, lessonId: 1, studentId: 1, attemptNumber: 1 }, { unique: true });
//# sourceMappingURL=exam-submission.schema.js.map