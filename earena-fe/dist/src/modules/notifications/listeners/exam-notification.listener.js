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
var ExamNotificationListener_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExamNotificationListener = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const notifications_service_1 = require("../notifications.service");
const notification_event_constant_1 = require("../constants/notification-event.constant");
const exam_event_constant_1 = require("../../exams/constants/exam-event.constant");
const exams_repository_1 = require("../../exams/exams.repository");
const exam_submissions_repository_1 = require("../../exams/exam-submissions.repository");
let ExamNotificationListener = ExamNotificationListener_1 = class ExamNotificationListener {
    notificationsService;
    examsRepo;
    examSubmissionsRepo;
    logger = new common_1.Logger(ExamNotificationListener_1.name);
    constructor(notificationsService, examsRepo, examSubmissionsRepo) {
        this.notificationsService = notificationsService;
        this.examsRepo = examsRepo;
        this.examSubmissionsRepo = examSubmissionsRepo;
    }
    async handleExamSubmitted(payload) {
        try {
            const submission = await this.examSubmissionsRepo.findByIdSafe(payload.submissionId, { select: 'examId' });
            if (!submission)
                return;
            const exam = await this.examsRepo.findByIdSafe(submission.examId, {
                select: 'title',
            });
            const examTitle = exam ? exam.title : 'Bài thi';
            await this.notificationsService.createAndDispatch({
                receiverId: payload.studentId,
                type: notification_event_constant_1.NotificationType.EXAM,
                title: 'Đã nộp bài thành công! 📝',
                message: `Hệ thống đã ghi nhận bài làm môn "${examTitle}" của bạn. Kết quả sẽ được cập nhật sớm nhất.`,
                payload: {
                    submissionId: payload.submissionId,
                    examId: submission.examId.toString(),
                    url: `/student/exams/${payload.submissionId}/result`,
                },
            });
        }
        catch (error) {
            this.logger.error(`[Listener Error] EXAM_SUBMITTED: ${error.message}`, error.stack);
        }
    }
    async handleExamGraded(payload) {
        try {
            const submission = await this.examSubmissionsRepo.findByIdSafe(payload.submissionId, { select: 'examId' });
            let examTitle = 'Bài thi';
            if (submission) {
                const exam = await this.examsRepo.findByIdSafe(submission.examId, {
                    select: 'title',
                });
                if (exam)
                    examTitle = exam.title;
            }
            let gradingMessage = `Bài thi "${examTitle}" của bạn đã có điểm: ${payload.score} điểm.`;
            if (payload.score >= 80) {
                gradingMessage = `Tuyệt vời! 🎉 Bài thi "${examTitle}" của bạn đạt ${payload.score} điểm.`;
            }
            else if (payload.score < 50) {
                gradingMessage = `Bài thi "${examTitle}" của bạn đạt ${payload.score} điểm. Hãy cố gắng ôn tập thêm nhé! 💪`;
            }
            await this.notificationsService.createAndDispatch({
                receiverId: payload.studentId,
                type: notification_event_constant_1.NotificationType.EXAM,
                title: 'Đã có điểm thi! 🎯',
                message: gradingMessage,
                payload: {
                    submissionId: payload.submissionId,
                    courseId: payload.courseId,
                    lessonId: payload.lessonId,
                    url: `/student/exams/${payload.submissionId}/result`,
                },
            });
        }
        catch (error) {
            this.logger.error(`[Listener Error] EXAM_GRADED: ${error.message}`, error.stack);
        }
    }
};
exports.ExamNotificationListener = ExamNotificationListener;
__decorate([
    (0, event_emitter_1.OnEvent)(exam_event_constant_1.ExamEventPattern.EXAM_SUBMITTED, { async: true }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ExamNotificationListener.prototype, "handleExamSubmitted", null);
__decorate([
    (0, event_emitter_1.OnEvent)(exam_event_constant_1.ExamEventPattern.EXAM_GRADED, { async: true }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ExamNotificationListener.prototype, "handleExamGraded", null);
exports.ExamNotificationListener = ExamNotificationListener = ExamNotificationListener_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [notifications_service_1.NotificationsService,
        exams_repository_1.ExamsRepository,
        exam_submissions_repository_1.ExamSubmissionsRepository])
], ExamNotificationListener);
//# sourceMappingURL=exam-notification.listener.js.map