import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  ExamEventPattern,
  type ExamSubmittedEventPayload,
} from '../constants/exam-event.constant';

@Injectable()
export class ExamGradingListener {
  private readonly logger = new Logger(ExamGradingListener.name);

  constructor(
    @InjectQueue('exam-grading') private readonly gradingQueue: Queue,
  ) {}

  @OnEvent(ExamEventPattern.EXAM_SUBMITTED, { async: true })
  async handleExamSubmittedEvent(payload: ExamSubmittedEventPayload) {
    this.logger.log(
      `[Listener] Bắt được sự kiện nộp bài ${payload.submissionId}. Đang đẩy vào Queue...`,
    );

    try {
      await this.gradingQueue.add(
        'grade-submission',
        {
          submissionId: payload.submissionId,
        },
        {
          removeOnComplete: true,
          attempts: 3,
          backoff: { type: 'exponential', delay: 1000 },
        },
      );
    } catch (error: any) {
      this.logger.error(
        `[Listener] Lỗi khi đẩy bài thi ${payload.submissionId} vào Queue: ${error.message}`,
        error.stack,
      );
    }
  }
}
