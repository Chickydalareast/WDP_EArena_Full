import { NotificationsService } from '../notifications.service';
import { CoursesRepository } from '../../courses/courses.repository';
import type { CourseCompletedEventPayload, CourseApprovedEventPayload, CourseRejectedEventPayload, CourseReviewedEventPayload, ReviewRepliedEventPayload, CourseSoldEventPayload, CoursePurchasedEventPayload, CourseNewLessonEventPayload } from '../../courses/constants/course-event.constant';
import { UsersRepository } from 'src/modules/users/users.repository';
import { EnrollmentsRepository } from 'src/modules/courses/repositories/enrollments.repository';
export declare class CourseNotificationListener {
    private readonly notificationsService;
    private readonly coursesRepo;
    private readonly usersRepo;
    private readonly enrollmentsRepo;
    private readonly logger;
    constructor(notificationsService: NotificationsService, coursesRepo: CoursesRepository, usersRepo: UsersRepository, enrollmentsRepo: EnrollmentsRepository);
    handleCourseCompleted(payload: CourseCompletedEventPayload): Promise<void>;
    handleCourseApproved(payload: CourseApprovedEventPayload): Promise<void>;
    handleCourseRejected(payload: CourseRejectedEventPayload): Promise<void>;
    handleCourseReviewed(payload: CourseReviewedEventPayload): Promise<void>;
    handleReviewReplied(payload: ReviewRepliedEventPayload): Promise<void>;
    handleCoursePurchased(payload: CoursePurchasedEventPayload): Promise<void>;
    handleCourseSold(payload: CourseSoldEventPayload): Promise<void>;
    handleCourseNewLesson(payload: CourseNewLessonEventPayload): Promise<void>;
}
