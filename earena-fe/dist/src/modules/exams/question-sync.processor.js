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
var QuestionSyncProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionSyncProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const mongoose_1 = require("mongoose");
const exam_papers_repository_1 = require("./exam-papers.repository");
const exams_repository_1 = require("./exams.repository");
const questions_repository_1 = require("../questions/questions.repository");
const question_interface_1 = require("../questions/interfaces/question.interface");
let QuestionSyncProcessor = QuestionSyncProcessor_1 = class QuestionSyncProcessor extends bullmq_1.WorkerHost {
    examPapersRepo;
    examsRepo;
    questionsRepo;
    logger = new common_1.Logger(QuestionSyncProcessor_1.name);
    constructor(examPapersRepo, examsRepo, questionsRepo) {
        super();
        this.examPapersRepo = examPapersRepo;
        this.examsRepo = examsRepo;
        this.questionsRepo = questionsRepo;
    }
    async process(job) {
        const { action, questionId } = job.data;
        const questionObjectId = new mongoose_1.Types.ObjectId(questionId);
        try {
            const unpublishedExams = await this.examsRepo.modelInstance
                .find({ isPublished: false })
                .select('_id')
                .lean();
            if (unpublishedExams.length === 0) {
                this.logger.debug(`[Sync] Bỏ qua ${questionId}. Không có đề nháp nào cần update.`);
                return;
            }
            const unpublishedExamIds = unpublishedExams.map((e) => e._id);
            const paperModel = this.examPapersRepo.modelInstance;
            if (action === question_interface_1.QuestionSyncAction.DELETE) {
                const updateResult = await paperModel.updateMany({
                    examId: { $in: unpublishedExamIds },
                    submissionId: null,
                }, {
                    $pull: {
                        questions: { originalQuestionId: questionObjectId },
                        answerKeys: { originalQuestionId: questionObjectId },
                    },
                });
                this.logger.log(`[Sync Worker] Đã dọn sạch câu hỏi ${questionId} khỏi ${updateResult.modifiedCount} Đề nháp.`);
            }
            else if (action === question_interface_1.QuestionSyncAction.UPDATE) {
                const question = await this.questionsRepo.findByIdSafe(questionObjectId);
                if (!question) {
                    this.logger.warn(`[Sync Worker] Hủy đồng bộ vì câu hỏi ${questionId} không còn tồn tại ở bảng gốc.`);
                    return;
                }
                const paperAnswers = (question.answers || []).map((a) => ({
                    id: a.id,
                    content: a.content,
                }));
                const correctAns = (question.answers || []).find((a) => a.isCorrect);
                const bulkOps = [];
                bulkOps.push({
                    updateMany: {
                        filter: {
                            examId: { $in: unpublishedExamIds },
                            submissionId: null,
                            'questions.originalQuestionId': questionObjectId,
                        },
                        update: {
                            $set: {
                                'questions.$[qElem].content': question.content,
                                'questions.$[qElem].explanation': question.explanation,
                                'questions.$[qElem].difficultyLevel': question.difficultyLevel,
                                'questions.$[qElem].answers': paperAnswers,
                                'questions.$[qElem].attachedMedia': question.attachedMedia || [],
                                'questions.$[qElem].type': question.type,
                            },
                        },
                        arrayFilters: [{ 'qElem.originalQuestionId': questionObjectId }],
                    },
                });
                if (correctAns) {
                    bulkOps.push({
                        updateMany: {
                            filter: {
                                examId: { $in: unpublishedExamIds },
                                submissionId: null,
                                'answerKeys.originalQuestionId': questionObjectId,
                            },
                            update: {
                                $set: { 'answerKeys.$[kElem].correctAnswerId': correctAns.id },
                            },
                            arrayFilters: [{ 'kElem.originalQuestionId': questionObjectId }],
                        },
                    });
                }
                const bulkResult = await paperModel.bulkWrite(bulkOps);
                this.logger.log(`[Sync Worker] Đồng bộ thành công câu hỏi ${questionId} vào ${bulkResult.modifiedCount} Đề nháp.`);
            }
        }
        catch (error) {
            this.logger.error(`[BullMQ Crash] Không thể đồng bộ câu hỏi ${questionId}. Mã lỗi: ${error.message}`);
            throw error;
        }
    }
};
exports.QuestionSyncProcessor = QuestionSyncProcessor;
exports.QuestionSyncProcessor = QuestionSyncProcessor = QuestionSyncProcessor_1 = __decorate([
    (0, bullmq_1.Processor)('question-sync'),
    __metadata("design:paramtypes", [exam_papers_repository_1.ExamPapersRepository,
        exams_repository_1.ExamsRepository,
        questions_repository_1.QuestionsRepository])
], QuestionSyncProcessor);
//# sourceMappingURL=question-sync.processor.js.map