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
var ExamTakeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExamTakeService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const mongoose_1 = require("mongoose");
const exam_submissions_repository_1 = require("./exam-submissions.repository");
const exam_papers_repository_1 = require("./exam-papers.repository");
const lessons_repository_1 = require("../courses/repositories/lessons.repository");
const enrollments_service_1 = require("../courses/services/enrollments.service");
const exam_generator_service_1 = require("./exam-generator.service");
const exam_submission_schema_1 = require("./schemas/exam-submission.schema");
const exam_schema_1 = require("./schemas/exam.schema");
const question_schema_1 = require("../questions/schemas/question.schema");
const exam_event_constant_1 = require("./constants/exam-event.constant");
const lesson_schema_1 = require("../courses/schemas/lesson.schema");
const redis_service_1 = require("../../common/redis/redis.service");
let ExamTakeService = ExamTakeService_1 = class ExamTakeService {
    submissionsRepo;
    papersRepo;
    lessonsRepo;
    enrollmentsService;
    examGeneratorService;
    eventEmitter;
    redisService;
    logger = new common_1.Logger(ExamTakeService_1.name);
    constructor(submissionsRepo, papersRepo, lessonsRepo, enrollmentsService, examGeneratorService, eventEmitter, redisService) {
        this.submissionsRepo = submissionsRepo;
        this.papersRepo = papersRepo;
        this.lessonsRepo = lessonsRepo;
        this.enrollmentsService = enrollmentsService;
        this.examGeneratorService = examGeneratorService;
        this.eventEmitter = eventEmitter;
        this.redisService = redisService;
    }
    async startExam(payload) {
        const { studentId, courseId, lessonId } = payload;
        const studentObjId = new mongoose_1.Types.ObjectId(studentId);
        const courseObjId = new mongoose_1.Types.ObjectId(courseId);
        const lessonObjId = new mongoose_1.Types.ObjectId(lessonId);
        const lockKey = `lock:exam-start:${studentId}:${lessonId}`;
        const isLocked = await this.redisService.setNx(lockKey, 'locked', 5);
        if (!isLocked) {
            throw new common_1.BadRequestException('Hệ thống đang xử lý tạo đề thi. Vui lòng không click liên tục!');
        }
        try {
            const lesson = await this.lessonsRepo.findByIdSafe(lessonObjId, {
                populate: 'examId',
            });
            if (!lesson || lesson.courseId.toString() !== courseId) {
                throw new common_1.BadRequestException('Dữ liệu không hợp lệ. Bài học không thuộc khóa học này.');
            }
            if (!lesson.examId) {
                throw new common_1.BadRequestException('Bài học này không chứa bài thi/quiz.');
            }
            const exam = lesson.examId;
            let rules = lesson.examRules;
            if (!rules) {
                this.logger.warn(`[Data Recovery] Bài học ${lessonObjId} bị khuyết cấu hình ExamRule. Kích hoạt Fallback mặc định.`);
                rules = {
                    timeLimit: 45,
                    maxAttempts: 1,
                    passPercentage: 50,
                    showResultMode: lesson_schema_1.ShowResultMode.IMMEDIATELY,
                };
            }
            if (exam.type === exam_schema_1.ExamType.COURSE_QUIZ) {
                if (exam.mode !== exam_schema_1.ExamMode.DYNAMIC) {
                    this.logger.error(`[Integrity Error] Course Quiz ${exam._id} bị mất cờ DYNAMIC.`);
                    throw new common_1.InternalServerErrorException('Dữ liệu Quiz bị lỗi (Không phải dạng động). Vui lòng báo Giáo viên kiểm tra lại cấu hình.');
                }
                if (!exam.dynamicConfig) {
                    throw new common_1.InternalServerErrorException('Dữ liệu Quiz bị lỗi (Mất cấu hình ma trận). Vui lòng báo Giáo viên cập nhật lại.');
                }
            }
            await this.enrollmentsService.validateCourseExamAccess(studentId, courseId, exam._id.toString());
            const latestSubmission = await this.submissionsRepo.findLatestSubmission(studentId, lessonId);
            if (latestSubmission &&
                latestSubmission.status === exam_submission_schema_1.SubmissionStatus.IN_PROGRESS) {
                const paper = await this.papersRepo.findByIdSafe(latestSubmission.examPaperId);
                return {
                    submissionId: latestSubmission._id,
                    status: latestSubmission.status,
                    timeLimit: rules.timeLimit,
                    startedAt: new mongoose_1.Types.ObjectId(latestSubmission._id.toString())
                        .getTimestamp()
                        .toISOString(),
                    paper: { questions: paper?.questions || [] },
                };
            }
            const nextAttemptNumber = latestSubmission
                ? latestSubmission.attemptNumber + 1
                : 1;
            if (nextAttemptNumber > rules.maxAttempts) {
                throw new common_1.ForbiddenException(`Bạn đã hết lượt làm bài (Tối đa ${rules.maxAttempts} lượt).`);
            }
            let paperQuestions = [];
            let paperAnswerKeys = [];
            if (exam.mode === exam_schema_1.ExamMode.STATIC) {
                const masterPaper = await this.papersRepo.findOneSafe({ examId: exam._id, submissionId: null }, { select: '+answerKeys' });
                if (!masterPaper)
                    throw new common_1.InternalServerErrorException('Đề thi tĩnh chưa có dữ liệu Master.');
                paperQuestions = masterPaper.questions;
                paperAnswerKeys = masterPaper.answerKeys;
            }
            else {
                if (!exam.dynamicConfig) {
                    throw new common_1.InternalServerErrorException('Đề thi động này bị lỗi mất cấu hình ma trận. Vui lòng báo giáo viên tạo lại đề.');
                }
                const dynamicContent = await this.examGeneratorService.generateJitPaperFromMatrix(exam.teacherId.toString(), exam.totalScore, exam.dynamicConfig.matrixId
                    ? exam.dynamicConfig.matrixId.toString()
                    : undefined, exam.dynamicConfig.adHocSections);
                paperQuestions = dynamicContent.questions;
                paperAnswerKeys = dynamicContent.answerKeys;
            }
            const shuffled = this.shufflePaperForStudent(paperQuestions, paperAnswerKeys);
            const initialAnswers = shuffled.questions.map((q) => ({
                questionId: q.originalQuestionId,
                selectedAnswerId: null,
            }));
            let actualSubmissionId = '';
            await this.submissionsRepo.executeInTransaction(async () => {
                const createdPaper = await this.papersRepo.createDocument({
                    examId: exam._id,
                    questions: shuffled.questions,
                    answerKeys: shuffled.answerKeys,
                });
                const createdSub = await this.submissionsRepo.createDocument({
                    studentId: studentObjId,
                    courseId: courseObjId,
                    lessonId: lessonObjId,
                    examId: exam._id,
                    examPaperId: createdPaper._id,
                    attemptNumber: nextAttemptNumber,
                    status: exam_submission_schema_1.SubmissionStatus.IN_PROGRESS,
                    answers: initialAnswers,
                });
                actualSubmissionId = createdSub._id.toString();
                await this.papersRepo.updateByIdSafe(createdPaper._id, {
                    $set: { submissionId: createdSub._id },
                });
            });
            this.logger.log(`[JIT Engine] Đã sinh Paper & Submission ${actualSubmissionId} từ Matrix Engine cho Exam ${exam._id}`);
            return {
                submissionId: actualSubmissionId,
                status: exam_submission_schema_1.SubmissionStatus.IN_PROGRESS,
                timeLimit: rules.timeLimit,
                startedAt: new mongoose_1.Types.ObjectId(actualSubmissionId)
                    .getTimestamp()
                    .toISOString(),
                paper: { questions: shuffled.questions },
            };
        }
        finally {
            await this.redisService.del(lockKey);
        }
    }
    async autoSaveAnswer(payload) {
        const { submissionId, studentId, questionId, selectedAnswerId } = payload;
        await this.submissionsRepo.saveDraftToRedis(submissionId, questionId, selectedAnswerId);
        return { success: true };
    }
    async submitExam(payload) {
        const { submissionId, studentId } = payload;
        const submission = await this.submissionsRepo.findOneSafe({
            _id: new mongoose_1.Types.ObjectId(submissionId),
            studentId: new mongoose_1.Types.ObjectId(studentId),
        }, { populate: 'lessonId' });
        if (!submission)
            throw new common_1.NotFoundException('Bài thi không tồn tại.');
        if (submission.status !== exam_submission_schema_1.SubmissionStatus.IN_PROGRESS) {
            throw new common_1.BadRequestException('Bài thi đã được nộp hoặc trạng thái không hợp lệ.');
        }
        const lesson = submission.lessonId;
        const timeLimit = lesson?.examRules?.timeLimit || 0;
        if (timeLimit > 0) {
            const startTimeMs = new mongoose_1.Types.ObjectId(submission._id.toString())
                .getTimestamp()
                .getTime();
            const nowMs = Date.now();
            const allowedTimeMs = timeLimit * 60 * 1000;
            const networkBufferMs = 60 * 1000;
            if (nowMs > startTimeMs + allowedTimeMs + networkBufferMs) {
                this.logger.warn(`[Security] Học viên ${studentId} cố tình nộp bài trễ. Bị block!`);
                throw new common_1.BadRequestException('Đã quá thời gian làm bài cho phép. Bài làm không được chấp nhận.');
            }
        }
        const success = await this.submissionsRepo.syncRedisToMongoOnSubmit(submissionId, studentId);
        if (!success)
            throw new common_1.InternalServerErrorException('Có lỗi xảy ra khi nộp bài.');
        const eventPayload = { submissionId, studentId };
        this.eventEmitter.emit(exam_event_constant_1.ExamEventPattern.EXAM_SUBMITTED, eventPayload);
        this.logger.log(`[Assessment Engine] Học viên ${studentId} nộp bài ${submissionId}. Đã phát sự kiện chấm điểm.`);
        return { message: 'Nộp bài thành công, hệ thống đang chấm điểm.' };
    }
    async getSubmissionResult(submissionId, studentId) {
        if (!mongoose_1.Types.ObjectId.isValid(submissionId))
            throw new common_1.BadRequestException('Mã bài thi không hợp lệ.');
        const submission = await this.submissionsRepo.findOneSafe({
            _id: new mongoose_1.Types.ObjectId(submissionId),
            studentId: new mongoose_1.Types.ObjectId(studentId),
        }, { populate: 'lessonId' });
        if (!submission)
            throw new common_1.NotFoundException('Không tìm thấy bài thi.');
        if (submission.status !== exam_submission_schema_1.SubmissionStatus.COMPLETED)
            throw new common_1.ForbiddenException('Bài thi chưa được nộp.');
        if (submission.score === null) {
            return {
                status: 'GRADING_IN_PROGRESS',
                message: 'Hệ thống đang chấm điểm. Vui lòng không thoát trang.',
                retryAfter: 2000,
            };
        }
        const paper = await this.papersRepo.findByIdSafe(submission.examPaperId, {
            select: '+answerKeys',
        });
        if (!paper)
            throw new common_1.InternalServerErrorException('Lỗi hệ thống: Mất liên kết Snapshot đề thi.');
        const lesson = submission.lessonId;
        const showResultMode = lesson?.examRules?.showResultMode || lesson_schema_1.ShowResultMode.IMMEDIATELY;
        const timeLimit = lesson?.examRules?.timeLimit || 0;
        let canShowDetails = true;
        if (showResultMode === lesson_schema_1.ShowResultMode.NEVER) {
            canShowDetails = false;
        }
        else if (showResultMode === lesson_schema_1.ShowResultMode.AFTER_END_TIME) {
            if (timeLimit > 0) {
                const startTimeMs = new mongoose_1.Types.ObjectId(submission._id.toString())
                    .getTimestamp()
                    .getTime();
                const endTimeMs = startTimeMs + timeLimit * 60 * 1000;
                if (Date.now() < endTimeMs) {
                    canShowDetails = false;
                }
            }
        }
        const correctAnswersMap = new Map();
        paper.answerKeys.forEach((key) => correctAnswersMap.set(key.originalQuestionId.toString(), key.correctAnswerId));
        const studentAnswersMap = new Map();
        submission.answers.forEach((ans) => studentAnswersMap.set(ans.questionId.toString(), ans.selectedAnswerId));
        const answerableQuestions = paper.questions.filter((q) => q.type !== question_schema_1.QuestionType.PASSAGE);
        const totalQuestions = answerableQuestions.length;
        let correctCount = 0;
        const details = answerableQuestions.map((q) => {
            const qId = q.originalQuestionId.toString();
            const studentSelectedId = studentAnswersMap.get(qId) || null;
            const correctAnswerId = correctAnswersMap.get(qId) || null;
            const isCorrect = studentSelectedId !== null && studentSelectedId === correctAnswerId;
            if (isCorrect)
                correctCount++;
            return {
                originalQuestionId: qId,
                content: q.content,
                difficultyLevel: q.difficultyLevel,
                answers: q.answers,
                studentSelectedId,
                correctAnswerId,
                isCorrect,
            };
        });
        return {
            status: 'COMPLETED',
            summary: {
                score: submission.score,
                totalQuestions,
                correctCount,
                incorrectCount: totalQuestions - correctCount,
                submittedAt: submission.submittedAt,
                attemptNumber: submission.attemptNumber,
            },
            message: canShowDetails
                ? 'Thành công'
                : 'Chi tiết đúng/sai được bảo mật theo cấu hình của bài học.',
            details: canShowDetails ? details : [],
        };
    }
    shufflePaperForStudent(questions, answerKeys) {
        const blocks = [];
        const passageMap = new Map();
        for (const q of questions) {
            if (q.type === question_schema_1.QuestionType.PASSAGE) {
                const block = { isPassage: true, passage: q, subQuestions: [] };
                passageMap.set(q.originalQuestionId.toString(), block);
                blocks.push(block);
            }
            else if (!q.parentPassageId) {
                blocks.push({ isPassage: false, question: q });
            }
        }
        for (const q of questions) {
            if (q.parentPassageId) {
                const parentBlock = passageMap.get(q.parentPassageId.toString());
                if (parentBlock)
                    parentBlock.subQuestions.push(q);
            }
        }
        const shuffledBlocks = this._shuffleArray(blocks);
        const finalQuestions = [];
        for (const block of shuffledBlocks) {
            if (block.isPassage) {
                finalQuestions.push({ ...block.passage });
                const shuffledSubs = this._shuffleArray(block.subQuestions);
                for (const sub of shuffledSubs) {
                    finalQuestions.push({
                        ...sub,
                        answers: this._shuffleArray(sub.answers),
                    });
                }
            }
            else {
                finalQuestions.push({
                    ...block.question,
                    answers: this._shuffleArray(block.question.answers),
                });
            }
        }
        return { questions: finalQuestions, answerKeys };
    }
    _shuffleArray(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }
    async getStudentHistory(payload) {
        const { studentId, page = 1, limit = 10, courseId, lessonId } = payload;
        return this.submissionsRepo.getStudentHistoryData(studentId, page, limit, courseId, lessonId);
    }
    async getStudentHistoryOverview(payload) {
        const { studentId, page, limit, courseId } = payload;
        return this.submissionsRepo.getStudentHistoryOverviewData(studentId, page, limit, courseId);
    }
    async getLessonAttempts(payload) {
        const { studentId, lessonId, page, limit } = payload;
        return this.submissionsRepo.getLessonAttemptsData(studentId, lessonId, page, limit);
    }
};
exports.ExamTakeService = ExamTakeService;
exports.ExamTakeService = ExamTakeService = ExamTakeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [exam_submissions_repository_1.ExamSubmissionsRepository,
        exam_papers_repository_1.ExamPapersRepository,
        lessons_repository_1.LessonsRepository,
        enrollments_service_1.EnrollmentsService,
        exam_generator_service_1.ExamGeneratorService,
        event_emitter_1.EventEmitter2,
        redis_service_1.RedisService])
], ExamTakeService);
//# sourceMappingURL=exam-take.service.js.map