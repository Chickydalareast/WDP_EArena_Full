import { Queue } from 'bullmq';
import { type ExamSubmittedEventPayload } from '../constants/exam-event.constant';
export declare class ExamGradingListener {
    private readonly gradingQueue;
    private readonly logger;
    constructor(gradingQueue: Queue);
    handleExamSubmittedEvent(payload: ExamSubmittedEventPayload): Promise<void>;
}
