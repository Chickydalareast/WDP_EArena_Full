// File: src/modules/courses/services/lesson-discussions.service.ts
import {
    Injectable,
    Logger,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { LessonDiscussionsRepository } from '../repositories/lesson-discussions.repository';
import { EnrollmentsRepository } from '../repositories/enrollments.repository';
import { CoursesRepository } from '../courses.repository';
import { LessonsRepository } from '../repositories/lessons.repository';
import { MediaRepository } from '../../media/media.repository';

import { MediaStatus } from '../../media/schemas/media.schema';
import { EnrollmentStatus } from '../schemas/enrollment.schema';
import {
    CourseEventPattern,
    CourseQuestionAskedEventPayload,
    CourseQuestionRepliedEventPayload,
} from '../constants/course-event.constant';

import {
    CreateDiscussionPayload,
    ReplyDiscussionPayload,
    GetDiscussionsParams,
    GetCourseDiscussionsParams,
} from '../interfaces/lesson-discussion.interface';

@Injectable()
export class LessonDiscussionsService {
    private readonly logger = new Logger(LessonDiscussionsService.name);

    constructor(
        private readonly discussionRepo: LessonDiscussionsRepository,
        private readonly enrollmentsRepo: EnrollmentsRepository,
        private readonly coursesRepo: CoursesRepository,
        private readonly lessonsRepo: LessonsRepository,
        private readonly mediaRepo: MediaRepository,
        private readonly eventEmitter: EventEmitter2,
    ) { }

    /**
     * Xác thực quyền truy cập khóa học (Chỉ Teacher của khóa hoặc Học viên ACTIVE mới được phép)
     */
    private async validateCourseAccess(userId: string, courseId: string): Promise<string> {
        const course = await this.coursesRepo.findByIdSafe(courseId, { select: 'teacherId' });
        if (!course) throw new NotFoundException('Khóa học không tồn tại.');

        const isTeacher = course.teacherId.toString() === userId;
        if (isTeacher) return course.teacherId.toString(); // Trả về ID teacher để dispatch notification sau này

        const enrollment = await this.enrollmentsRepo.findOneSafe({
            userId: new Types.ObjectId(userId),
            courseId: new Types.ObjectId(courseId),
            status: EnrollmentStatus.ACTIVE,
        });

        if (!enrollment) {
            throw new ForbiddenException('Bạn phải ghi danh khóa học để tham gia thảo luận.');
        }

        return course.teacherId.toString();
    }

    /**
     * Đảm bảo Lesson thuộc về Course và tồn tại
     */
    private async validateLessonContext(courseId: string, lessonId: string): Promise<void> {
        const lesson = await this.lessonsRepo.findOneSafe(
            { _id: new Types.ObjectId(lessonId), courseId: new Types.ObjectId(courseId) },
            { select: '_id' }
        );
        if (!lesson) {
            throw new BadRequestException('Bài học không hợp lệ hoặc không thuộc khóa học này.');
        }
    }


    private async verifyMediaOwnershipStrict(mediaIds: string[], userId: string): Promise<void> {
        if (!mediaIds || mediaIds.length === 0) return;

        const uniqueIds = Array.from(new Set(mediaIds));
        const medias = await this.mediaRepo.modelInstance
            .find({ _id: { $in: uniqueIds.map((id) => new Types.ObjectId(id)) } })
            .lean()
            .select('uploadedBy status originalName')
            .exec();

        if (medias.length !== uniqueIds.length) {
            throw new BadRequestException('Một hoặc nhiều tệp đính kèm không tồn tại trên hệ thống.');
        }

        for (const media of medias) {
            if (media.uploadedBy.toString() !== userId) {
                this.logger.warn(`[Security] User ${userId} cố gắng dùng tệp ${media._id} của người khác.`);
                throw new ForbiddenException(`Tệp tin "${media.originalName}" không thuộc quyền sở hữu của bạn.`);
            }
            if (media.status !== MediaStatus.READY) {
                throw new BadRequestException(`Tệp tin "${media.originalName}" đang xử lý hoặc bị lỗi.`);
            }
        }
    }

    async createQuestion(payload: CreateDiscussionPayload) {
        const teacherId = await this.validateCourseAccess(payload.userId, payload.courseId);
        await this.validateLessonContext(payload.courseId, payload.lessonId);
        await this.verifyMediaOwnershipStrict(payload.attachments || [], payload.userId);

        const discussionData = {
            courseId: new Types.ObjectId(payload.courseId),
            lessonId: new Types.ObjectId(payload.lessonId),
            userId: new Types.ObjectId(payload.userId),
            content: payload.content,
            attachments: payload.attachments?.map((id) => new Types.ObjectId(id)) || [],
            parentId: null,
            replyCount: 0,
            lastRepliedAt: null,
        };

        const newQuestion = await this.discussionRepo.createDocument(discussionData);

        // Không gửi thông báo cho chính mình nếu Teacher tự đăng Question
        if (teacherId !== payload.userId) {
            this.eventEmitter.emit(CourseEventPattern.COURSE_QUESTION_ASKED, {
                courseId: payload.courseId,
                lessonId: payload.lessonId,
                teacherId,
                studentId: payload.userId,
                discussionId: newQuestion._id.toString(),
                questionPreview: payload.content.substring(0, 100),
            } as CourseQuestionAskedEventPayload);
        }

        return { id: newQuestion._id.toString(), message: 'Đã gửi câu hỏi thành công.' };
    }

    async replyToQuestion(payload: ReplyDiscussionPayload) {
        await this.validateCourseAccess(payload.userId, payload.courseId);
        await this.validateLessonContext(payload.courseId, payload.lessonId);

        const rootQuestion = await this.discussionRepo.findByIdSafe(payload.parentId, { select: 'lessonId userId parentId' });

        if (!rootQuestion || rootQuestion.lessonId.toString() !== payload.lessonId) {
            throw new NotFoundException('Câu hỏi gốc không tồn tại hoặc không khớp bài học.');
        }

        if (rootQuestion.parentId !== null) {
            throw new BadRequestException('Hệ thống chỉ hỗ trợ thảo luận 1 cấp độ. Vui lòng reply vào câu hỏi gốc.');
        }

        await this.verifyMediaOwnershipStrict(payload.attachments || [], payload.userId);

        const newReply = await this.discussionRepo.executeInTransaction(async () => {
            const replyData = {
                courseId: new Types.ObjectId(payload.courseId),
                lessonId: new Types.ObjectId(payload.lessonId),
                userId: new Types.ObjectId(payload.userId),
                content: payload.content,
                attachments: payload.attachments?.map((id) => new Types.ObjectId(id)) || [],
                parentId: new Types.ObjectId(payload.parentId),
                replyCount: 0,
            };

            const created = await this.discussionRepo.createDocument(replyData);
            await this.discussionRepo.atomicUpdateReplyCount(payload.parentId, 1);
            return created;
        });

        const rootAuthorId = rootQuestion.userId.toString();
        if (payload.userId !== rootAuthorId) {
            this.eventEmitter.emit(CourseEventPattern.COURSE_QUESTION_REPLIED, {
                courseId: payload.courseId,
                lessonId: payload.lessonId,
                rootDiscussionId: payload.parentId,
                replyId: newReply._id.toString(),
                replierId: payload.userId,
                receiverId: rootAuthorId,
                replyPreview: payload.content.substring(0, 100),
            } as CourseQuestionRepliedEventPayload);
        }

        return { id: newReply._id.toString(), message: 'Đã phản hồi thành công.' };
    }

    async getLessonQuestions(params: GetDiscussionsParams) {
        await this.validateCourseAccess(params.userId, params.courseId);
        return this.discussionRepo.findRootDiscussionsPaginated(params);
    }

    async getQuestionReplies(userId: string, courseId: string, parentId: string) {
        await this.validateCourseAccess(userId, courseId);
        const replies = await this.discussionRepo.findRepliesByParentId(parentId);
        return { data: replies };
    }

    private async validateTeacherOwnershipStrict(userId: string, courseId: string): Promise<void> {
        const course = await this.coursesRepo.findByIdSafe(courseId, { select: 'teacherId' });
        if (!course) throw new NotFoundException('Khóa học không tồn tại.');

        if (course.teacherId.toString() !== userId) {
            throw new ForbiddenException('Quyền truy cập bị từ chối. Chỉ giáo viên chủ quản mới có thể xem toàn bộ thảo luận của khóa học.');
        }
    }

    async getCourseQuestions(params: GetCourseDiscussionsParams) {
        await this.validateTeacherOwnershipStrict(params.userId, params.courseId);
        return this.discussionRepo.findCourseDiscussionsPaginated(params);
    }
}