import type { LessonCompletedEventPayload } from '../constants/progress-event.constant';
import { LessonProgressRepository } from '../repositories/lesson-progress.repository';
import { LessonsRepository } from '../repositories/lessons.repository';
import { CourseReviewsRepository } from '../repositories/course-reviews.repository';
import { NotificationsService } from '../../notifications/notifications.service';
export declare class CourseProgressionListener {
    private readonly lessonsRepo;
    private readonly lessonProgressRepo;
    private readonly reviewsRepo;
    private readonly notificationsService;
    private readonly logger;
    constructor(lessonsRepo: LessonsRepository, lessonProgressRepo: LessonProgressRepository, reviewsRepo: CourseReviewsRepository, notificationsService: NotificationsService);
    handleLessonCompletedForReview(payload: LessonCompletedEventPayload): Promise<void>;
}
