import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Types } from 'mongoose';
import { ProgressEventPattern } from '../constants/progress-event.constant';
import type { LessonCompletedEventPayload } from '../constants/progress-event.constant';
import { LessonProgressRepository } from '../repositories/lesson-progress.repository';
import { LessonsRepository } from '../repositories/lessons.repository';
import { CourseReviewsRepository } from '../repositories/course-reviews.repository';
import { NotificationsService } from '../../notifications/notifications.service';

@Injectable()
export class CourseProgressionListener {
    private readonly logger = new Logger(CourseProgressionListener.name);

    constructor(
        private readonly lessonsRepo: LessonsRepository,
        private readonly lessonProgressRepo: LessonProgressRepository,
        private readonly reviewsRepo: CourseReviewsRepository,
        private readonly notificationsService: NotificationsService,
    ) { }

    @OnEvent(ProgressEventPattern.LESSON_COMPLETED, { async: true })
    async handleLessonCompletedForReview(payload: LessonCompletedEventPayload) {
        if (!payload.isFirstCompletion) return;

        try {
            const totalLessons = await this.lessonsRepo.countLessonsByCourse(payload.courseId);
            if (totalLessons === 0) return;

            const completedLessons = await this.lessonProgressRepo.modelInstance.countDocuments({
                userId: new Types.ObjectId(payload.userId),
                courseId: new Types.ObjectId(payload.courseId),
                isCompleted: true,
            }).exec();

            const isExactly3Lessons = completedLessons === 3;
            const isExactly20Percent = completedLessons === Math.ceil(totalLessons * 0.2);
            const isCompletionHook = completedLessons === totalLessons;

            const isEarlyHook = isExactly3Lessons || isExactly20Percent;

            if (!isEarlyHook && !isCompletionHook) return;

            const existingReview = await this.reviewsRepo.findOneSafe({
                userId: new Types.ObjectId(payload.userId),
                courseId: new Types.ObjectId(payload.courseId)
            }, { select: '_id' });

            if (existingReview) return;

            let title = 'Bạn nghĩ sao về khóa học? ⭐';
            let message = 'Bạn đã đi được một chặng đường tuyệt vời. Hãy dành 1 phút chia sẻ cảm nhận để giúp khóa học tốt hơn nhé!';
            let actionType = 'PROMPT_REVIEW_EARLY';

            if (isCompletionHook) {
                title = 'Chúc mừng bạn đã hoàn thành khóa học! 🏆';
                message = 'Tuyệt vời! Bạn đã chinh phục 100% nội dung. Đừng quên để lại đánh giá vinh danh nỗ lực này nhé!';
                actionType = 'PROMPT_REVIEW_COMPLETED';
            }

            await this.notificationsService.createAndDispatch({
                receiverId: payload.userId,
                type: 'COURSE' as any,
                title,
                message,
                payload: {
                    action: actionType,
                    courseId: payload.courseId,
                    lessonId: payload.lessonId,
                    url: `/student/courses/${payload.courseId}/review`
                } as any
            });

            this.logger.log(`[SSE Bridge] Đã bắn tín hiệu ${actionType} tới User ${payload.userId} cho Course ${payload.courseId}`);

        } catch (error: any) {
            this.logger.error(`[Progression Listener Error] Lỗi khi xử lý Milestone Review: ${error.message}`, error.stack);
        }
    }
}