import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationsService } from '../notifications.service';
import { NotificationType } from '../constants/notification-event.constant';

import { CoursesRepository } from '../../courses/courses.repository';
import type {
    CourseCompletedEventPayload,
    CourseApprovedEventPayload,
    CourseRejectedEventPayload,
    CourseReviewedEventPayload,
    ReviewRepliedEventPayload,
    CourseSubmittedEventPayload,
    CourseSoldEventPayload,
    CoursePurchasedEventPayload,
    CourseNewLessonEventPayload
} from '../../courses/constants/course-event.constant';
import { CourseEventPattern } from '../../courses/constants/course-event.constant';
import { UsersRepository } from 'src/modules/users/users.repository';
import { EnrollmentsRepository } from 'src/modules/courses/repositories/enrollments.repository';

@Injectable()
export class CourseNotificationListener {
    private readonly logger = new Logger(CourseNotificationListener.name);

    constructor(
        private readonly notificationsService: NotificationsService,
        private readonly coursesRepo: CoursesRepository,
        private readonly usersRepo: UsersRepository,
        private readonly enrollmentsRepo: EnrollmentsRepository,
    ) { }

    @OnEvent(CourseEventPattern.COURSE_COMPLETED, { async: true })
    async handleCourseCompleted(payload: CourseCompletedEventPayload) {
        try {
            const course = await this.coursesRepo.findByIdSafe(payload.courseId, { select: 'title' });
            const courseTitle = course ? course.title : 'Khóa học';

            await this.notificationsService.createAndDispatch({
                receiverId: payload.userId,
                type: NotificationType.COURSE,
                title: 'Hoàn thành khóa học! 🎓',
                message: `Chúc mừng bạn đã xuất sắc hoàn thành "${courseTitle}". Hãy để lại đánh giá nhé!`,
                payload: { courseId: payload.courseId, url: `/student/courses/${payload.courseId}/study` }
            });
        } catch (error: any) {
            this.logger.error(`[Listener Error] COURSE_COMPLETED: ${error.message}`, error.stack);
        }
    }

    @OnEvent(CourseEventPattern.COURSE_APPROVED, { async: true })
    async handleCourseApproved(payload: CourseApprovedEventPayload) {
        try {
            await this.notificationsService.createAndDispatch({
                receiverId: payload.teacherId,
                type: NotificationType.SYSTEM,
                title: 'Khóa học đã được duyệt! 🎉',
                message: `Khóa học "${payload.courseTitle}" của bạn đã được Admin phê duyệt và xuất bản.`,
                payload: { courseId: payload.courseId, url: `/teacher/courses/${payload.courseId}/settings` }
            });
        } catch (error: any) {
            this.logger.error(`[Listener Error] COURSE_APPROVED: ${error.message}`, error.stack);
        }
    }

    @OnEvent(CourseEventPattern.COURSE_REJECTED, { async: true })
    async handleCourseRejected(payload: CourseRejectedEventPayload) {
        try {
            await this.notificationsService.createAndDispatch({
                receiverId: payload.teacherId,
                type: NotificationType.SYSTEM,
                title: 'Khóa học bị từ chối phê duyệt ❌',
                message: `Khóa học "${payload.courseTitle}" cần được chỉnh sửa. Lý do: ${payload.reason}`,
                payload: { courseId: payload.courseId, url: `/teacher/courses/${payload.courseId}/builder` }
            });
        } catch (error: any) {
            this.logger.error(`[Listener Error] COURSE_REJECTED: ${error.message}`, error.stack);
        }
    }

    @OnEvent(CourseEventPattern.COURSE_REVIEWED, { async: true })
    async handleCourseReviewed(payload: CourseReviewedEventPayload) {
        try {
            await this.notificationsService.createAndDispatch({
                receiverId: payload.teacherId,
                type: NotificationType.COURSE,
                title: 'Có đánh giá mới! ⭐',
                message: `Khóa học "${payload.courseTitle}" vừa nhận được đánh giá ${payload.rating} sao từ học viên.`,
                payload: { courseId: payload.courseId, url: `/teacher/courses/${payload.courseId}/settings` }
            });
        } catch (error: any) {
            this.logger.error(`[Listener Error] COURSE_REVIEWED: ${error.message}`, error.stack);
        }
    }

    @OnEvent(CourseEventPattern.REVIEW_REPLIED, { async: true })
    async handleReviewReplied(payload: ReviewRepliedEventPayload) {
        try {
            await this.notificationsService.createAndDispatch({
                receiverId: payload.studentId,
                type: NotificationType.COURSE,
                title: 'Giáo viên đã phản hồi 💬',
                message: `Giáo viên vừa phản hồi đánh giá của bạn trong khóa học "${payload.courseTitle}".`,
                payload: { courseId: payload.courseId, url: `/student/courses/${payload.courseId}/study` }
            });
        } catch (error: any) {
            this.logger.error(`[Listener Error] REVIEW_REPLIED: ${error.message}`, error.stack);
        }
    }

    @OnEvent(CourseEventPattern.COURSE_PURCHASED, { async: true })
    async handleCoursePurchased(payload: CoursePurchasedEventPayload) {
        try {
            await this.notificationsService.createAndDispatch({
                receiverId: payload.userId,
                type: NotificationType.COURSE,
                title: 'Ghi danh thành công! 🚀',
                message: `Bạn đã mua thành công khóa học "${payload.courseTitle}". Bắt đầu hành trình học tập ngay thôi!`,
                payload: { courseId: payload.courseId, url: `/student/courses/${payload.courseId}/study` }
            });
        } catch (error: any) {
            this.logger.error(`[Listener Error] COURSE_PURCHASED: ${error.message}`, error.stack);
        }
    }

    @OnEvent(CourseEventPattern.COURSE_SOLD, { async: true })
    async handleCourseSold(payload: CourseSoldEventPayload) {
        try {
            const student = await this.usersRepo.findByIdSafe(payload.studentId, { select: 'fullName' });
            const studentName = student ? student.fullName : 'Một học viên';
            const amountFormatted = payload.revenueAmount.toLocaleString('vi-VN');

            await this.notificationsService.createAndDispatch({
                receiverId: payload.teacherId,
                type: NotificationType.FINANCE,
                title: 'Có người mua khóa học! 💰',
                message: `Học viên ${studentName} vừa đăng ký khóa học "${payload.courseTitle}". Bạn nhận được ${amountFormatted} Coin doanh thu.`,
                payload: { courseId: payload.courseId, url: `/teacher/wallet` }
            });
        } catch (error: any) {
            this.logger.error(`[Listener Error] COURSE_SOLD: ${error.message}`, error.stack);
        }
    }

    @OnEvent(CourseEventPattern.COURSE_NEW_LESSON, { async: true })
    async handleCourseNewLesson(payload: CourseNewLessonEventPayload) {
        try {
            const studentIds = await this.enrollmentsRepo.findActiveStudentIdsByCourse(payload.courseId);
            if (!studentIds || studentIds.length === 0) return;

            const CHUNK_SIZE = 500;
            
            for (let i = 0; i < studentIds.length; i += CHUNK_SIZE) {
                const chunk = studentIds.slice(i, i + CHUNK_SIZE);
                
                await Promise.all(
                    chunk.map(studentId =>
                        this.notificationsService.createAndDispatch({
                            receiverId: studentId,
                            type: NotificationType.COURSE,
                            title: 'Bài học mới! 📚',
                            message: `Khóa học "${payload.courseTitle}" vừa có thêm bài học mới: "${payload.lessonTitle}". Vào xem ngay!`,
                            payload: { 
                                courseId: payload.courseId,
                                lessonId: payload.lessonId,
                                url: `/student/courses/${payload.courseId}/study?lessonId=${payload.lessonId}`
                            }
                        })
                    )
                );
            }
        } catch (error: any) {
            this.logger.error(`[Listener Error] COURSE_NEW_LESSON: ${error.message}`, error.stack);
        }
    }
}