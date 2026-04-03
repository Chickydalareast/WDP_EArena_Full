import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationsService } from '../notifications.service';
import {
  NotificationType,
  NotificationEventPattern,
} from '../constants/notification-event.constant';

@Injectable()
export class QuestionNotificationListener {
  private readonly logger = new Logger(QuestionNotificationListener.name);

  constructor(private readonly notificationsService: NotificationsService) {}

  @OnEvent(NotificationEventPattern.QUESTION_AUTO_TAG_BATCH_COMPLETED, {
    async: true,
  })
  async handleAutoTagBatchCompleted(payload: any) {
    try {
      await this.notificationsService.createAndDispatch({
        receiverId: payload.teacherId,
        type: NotificationType.SYSTEM,
        title: 'Tiến độ AI Phân loại',
        message: `Đã phân tích xong lô ${payload.batchNum}/${payload.totalBatches} câu hỏi. Dữ liệu đã được cập nhật.`,
        payload: {
          metadata: {
            event: 'AUTO_TAG_BATCH_COMPLETED',
            batchNum: payload.batchNum,
            totalBatches: payload.totalBatches,
            processedQuestions: payload.processedQuestions,
          },
        },
      });
      this.logger.debug(
        `[SSE Fired] Đã bắn thông báo cập nhật UI cho lô ${payload.batchNum}/${payload.totalBatches} tới Teacher ${payload.teacherId}`,
      );
    } catch (error: any) {
      this.logger.error(
        `[Listener Error] AUTO_TAG_BATCH: ${error.message}`,
        error.stack,
      );
    }
  }
}
