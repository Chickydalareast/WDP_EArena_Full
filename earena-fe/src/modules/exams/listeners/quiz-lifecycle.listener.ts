import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ExamsService } from '../exams.service';
import { CourseEventPattern } from 'src/modules/courses/constants/course-event.constant';
import * as courseEventConstant from 'src/modules/courses/constants/course-event.constant';

@Injectable()
export class QuizLifecycleListener {
  private readonly logger = new Logger(QuizLifecycleListener.name);

  constructor(private readonly examsService: ExamsService) {}

  @OnEvent(CourseEventPattern.COURSE_STATUS_DEACTIVATED, { async: true })
  async handleCourseDeactivated(
    payload: courseEventConstant.CourseDeactivatedEventPayload,
  ) {
    try {
      await this.examsService.unpublishAllQuizzesByCourse(payload.courseId);
      this.logger.log(
        `[Quiz Lifecycle] Đã unpublish tất cả Quiz của Course ${payload.courseId} ` +
          `(Lý do: ${payload.reason})`,
      );
    } catch (error: any) {
      this.logger.error(
        `[Quiz Lifecycle] Lỗi khi unpublish quiz cho Course ${payload.courseId}: ${error.message}`,
        error.stack,
      );
    }
  }
}
