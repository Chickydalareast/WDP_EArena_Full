import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationsService } from '../notifications.service';
import { NotificationType } from '../constants/notification-event.constant';
import { ExamEventPattern } from '../../exams/constants/exam-event.constant';

import type { ExamSubmittedEventPayload, ExamGradedEventPayload } from '../../exams/constants/exam-event.constant';
import { ExamsRepository } from '../../exams/exams.repository';
import { ExamSubmissionsRepository } from '../../exams/exam-submissions.repository';

@Injectable()
export class ExamNotificationListener {
    private readonly logger = new Logger(ExamNotificationListener.name);

    constructor(
        private readonly notificationsService: NotificationsService,
        private readonly examsRepo: ExamsRepository,
        private readonly examSubmissionsRepo: ExamSubmissionsRepository,
    ) { }

    @OnEvent(ExamEventPattern.EXAM_SUBMITTED, { async: true })
    async handleExamSubmitted(payload: ExamSubmittedEventPayload) {
        try {
            const submission = await this.examSubmissionsRepo.findByIdSafe(payload.submissionId, { select: 'examId' });
            if (!submission) return;

            const exam = await this.examsRepo.findByIdSafe(submission.examId, { select: 'title' });
            const examTitle = exam ? exam.title : 'Bài thi';

            await this.notificationsService.createAndDispatch({
                receiverId: payload.studentId,
                type: NotificationType.EXAM,
                title: 'Đã nộp bài thành công! 📝',
                message: `Hệ thống đã ghi nhận bài làm môn "${examTitle}" của bạn. Kết quả sẽ được cập nhật sớm nhất.`,
                payload: {
                    submissionId: payload.submissionId,
                    examId: submission.examId.toString(),
                    url: `/student/exams/${payload.submissionId}/result`
                }
            });
        } catch (error: any) {
            this.logger.error(`[Listener Error] EXAM_SUBMITTED: ${error.message}`, error.stack);
        }
    }

    @OnEvent(ExamEventPattern.EXAM_GRADED, { async: true })
    async handleExamGraded(payload: ExamGradedEventPayload) {
        try {
            const submission = await this.examSubmissionsRepo.findByIdSafe(payload.submissionId, { select: 'examId' });
            let examTitle = 'Bài thi';
            if (submission) {
                const exam = await this.examsRepo.findByIdSafe(submission.examId, { select: 'title' });
                if (exam) examTitle = exam.title;
            }

            let gradingMessage = `Bài thi "${examTitle}" của bạn đã có điểm: ${payload.score} điểm.`;
            if (payload.score >= 80) {
                gradingMessage = `Tuyệt vời! 🎉 Bài thi "${examTitle}" của bạn đạt ${payload.score} điểm.`;
            } else if (payload.score < 50) {
                gradingMessage = `Bài thi "${examTitle}" của bạn đạt ${payload.score} điểm. Hãy cố gắng ôn tập thêm nhé! 💪`;
            }

            await this.notificationsService.createAndDispatch({
                receiverId: payload.studentId,
                type: NotificationType.EXAM,
                title: 'Đã có điểm thi! 🎯',
                message: gradingMessage,
                payload: {
                    submissionId: payload.submissionId,
                    courseId: payload.courseId,
                    lessonId: payload.lessonId,
                    url: `/student/exams/${payload.submissionId}/result`
                }
            });
        } catch (error: any) {
            this.logger.error(`[Listener Error] EXAM_GRADED: ${error.message}`, error.stack);
        }
    }
}