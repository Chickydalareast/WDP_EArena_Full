import { NotificationsService } from '../notifications.service';
import type { ExamSubmittedEventPayload, ExamGradedEventPayload } from '../../exams/constants/exam-event.constant';
import { ExamsRepository } from '../../exams/exams.repository';
import { ExamSubmissionsRepository } from '../../exams/exam-submissions.repository';
export declare class ExamNotificationListener {
    private readonly notificationsService;
    private readonly examsRepo;
    private readonly examSubmissionsRepo;
    private readonly logger;
    constructor(notificationsService: NotificationsService, examsRepo: ExamsRepository, examSubmissionsRepo: ExamSubmissionsRepository);
    handleExamSubmitted(payload: ExamSubmittedEventPayload): Promise<void>;
    handleExamGraded(payload: ExamGradedEventPayload): Promise<void>;
}
