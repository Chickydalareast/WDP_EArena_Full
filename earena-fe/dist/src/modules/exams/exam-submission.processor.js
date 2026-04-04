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
var ExamSubmissionProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExamSubmissionProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const mongoose_1 = require("mongoose");
const event_emitter_1 = require("@nestjs/event-emitter");
const exam_submissions_repository_1 = require("./exam-submissions.repository");
const exam_papers_repository_1 = require("./exam-papers.repository");
const exams_repository_1 = require("./exams.repository");
const enrollments_service_1 = require("../courses/services/enrollments.service");
const exam_event_constant_1 = require("./constants/exam-event.constant");
const question_schema_1 = require("../questions/schemas/question.schema");
let ExamSubmissionProcessor = ExamSubmissionProcessor_1 = class ExamSubmissionProcessor extends bullmq_1.WorkerHost {
    submissionsRepo;
    papersRepo;
    examsRepo;
    enrollmentsService;
    eventEmitter;
    logger = new common_1.Logger(ExamSubmissionProcessor_1.name);
    constructor(submissionsRepo, papersRepo, examsRepo, enrollmentsService, eventEmitter) {
        super();
        this.submissionsRepo = submissionsRepo;
        this.papersRepo = papersRepo;
        this.examsRepo = examsRepo;
        this.enrollmentsService = enrollmentsService;
        this.eventEmitter = eventEmitter;
    }
    async process(job) {
        if (job.name === 'grade-submission') {
            return this.handleGrading(job);
        }
        this.logger.warn(`Unknown job name: ${job.name}`);
    }
    async handleGrading(job) {
        this.logger.log(`[Worker] Đang tiếp nhận chấm điểm bài thi: ${job.data.submissionId}`);
        try {
            const submissionId = new mongoose_1.Types.ObjectId(job.data.submissionId);
            const submission = await this.submissionsRepo.findByIdSafe(submissionId, {
                populate: { path: 'lessonId', select: 'examRules' },
            });
            if (!submission) {
                this.logger.error(`[Worker] Bài thi ${submissionId} không tồn tại trong DB.`);
                return;
            }
            if (typeof submission.score === 'number') {
                this.logger.warn(`[Worker] Bài thi ${submissionId} đã có điểm (${submission.score}). Bỏ qua để tránh duplicate processing.`);
                return;
            }
            const paperModel = await this.papersRepo.findByIdSafe(submission.examPaperId, {
                select: '+answerKeys',
            });
            if (!paperModel) {
                this.logger.error(`[Worker] Không tìm thấy mã đề Snapshot ${submission.examPaperId}`);
                return;
            }
            const examDoc = await this.examsRepo.modelInstance
                .findById(submission.examId)
                .select('totalScore')
                .lean()
                .exec();
            if (!examDoc) {
                this.logger.error(`[Worker] Không tìm thấy Exam ${submission.examId} để lấy totalScore.`);
                return;
            }
            const totalScore = examDoc.totalScore;
            const answerableQuestions = (paperModel.questions || []).filter((q) => q.type !== question_schema_1.QuestionType.PASSAGE);
            const totalQuestions = answerableQuestions.length || 0;
            const defaultPointsPerQuestion = totalQuestions > 0 ? totalScore / totalQuestions : 0;
            const correctAnswersMap = new Map();
            (paperModel.answerKeys || []).forEach((key) => {
                correctAnswersMap.set(key.originalQuestionId.toString(), key.correctAnswerId);
            });
            const pointsMap = new Map();
            answerableQuestions.forEach((q) => {
                pointsMap.set(q.originalQuestionId.toString(), q.points !== null ? q.points : defaultPointsPerQuestion);
            });
            let earnedScore = 0;
            let correctCount = 0;
            const gradedAnswers = (submission.answers || []).map((studentAns) => {
                const qId = studentAns.questionId.toString();
                const correctId = correctAnswersMap.get(qId);
                const isCorrect = studentAns.selectedAnswerId
                    ? studentAns.selectedAnswerId === correctId
                    : false;
                if (isCorrect) {
                    correctCount++;
                    earnedScore += pointsMap.get(qId) || 0;
                }
                return { ...studentAns, isCorrect };
            });
            const finalScore = parseFloat(earnedScore.toFixed(2));
            await this.submissionsRepo.updateByIdSafe(submissionId.toString(), {
                $set: {
                    score: finalScore,
                    answers: gradedAnswers,
                },
            });
            this.logger.log(`[Worker] Chấm xong ${submissionId} | Điểm: ${finalScore}/${totalScore} | Tỷ lệ: ${correctCount}/${totalQuestions}`);
            if (submission.courseId && submission.lessonId) {
                const lessonData = submission.lessonId;
                this.eventEmitter.emit(exam_event_constant_1.ExamEventPattern.EXAM_GRADED, {
                    submissionId: submissionId.toString(),
                    studentId: submission.studentId.toString(),
                    courseId: submission.courseId.toString(),
                    lessonId: lessonData._id.toString(),
                    score: finalScore,
                });
                const requiredPercentage = lessonData?.examRules?.passPercentage ?? 50;
                const actualPercentage = totalScore > 0 ? (finalScore / totalScore) * 100 : 0;
                if (actualPercentage >= requiredPercentage) {
                    try {
                        await this.enrollmentsService.markLessonCompleted({
                            userId: submission.studentId.toString(),
                            courseId: submission.courseId.toString(),
                            lessonId: lessonData._id.toString(),
                        });
                        this.logger.log(`[Worker] Đã cập nhật pass Lesson cho User [${submission.studentId}]`);
                    }
                    catch (hookError) {
                        this.logger.error(`[Worker] Điểm đã chấm nhưng lỗi cập nhật tiến độ: ${hookError.message}`);
                    }
                }
                else {
                    this.logger.log(`[Worker] User [${submission.studentId}] đạt ${actualPercentage}%, chưa đủ pass (${requiredPercentage}%) để qua bài.`);
                }
            }
        }
        catch (error) {
            this.logger.error(`[Worker] Lỗi cục bộ khi xử lý chấm bài: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.ExamSubmissionProcessor = ExamSubmissionProcessor;
exports.ExamSubmissionProcessor = ExamSubmissionProcessor = ExamSubmissionProcessor_1 = __decorate([
    (0, bullmq_1.Processor)('exam-grading'),
    __metadata("design:paramtypes", [exam_submissions_repository_1.ExamSubmissionsRepository,
        exam_papers_repository_1.ExamPapersRepository,
        exams_repository_1.ExamsRepository,
        enrollments_service_1.EnrollmentsService,
        event_emitter_1.EventEmitter2])
], ExamSubmissionProcessor);
//# sourceMappingURL=exam-submission.processor.js.map