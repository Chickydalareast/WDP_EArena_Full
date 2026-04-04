import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { Types } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CoursesRepository } from '../../courses/courses.repository';
import { CoursesService } from '../../courses/courses.service';
import { MailService } from '../../mail/mail.service';
import { CourseStatus } from '../../courses/schemas/course.schema';
import { ExamGeneratorService } from '../../exams/exam-generator.service';
import {
    CourseEventPattern,
    CourseApprovedEventPayload,
    CourseRejectedEventPayload
} from '../../courses/constants/course-event.constant';
import {
    ApproveCoursePayload,
    ForceTakedownCoursePayload,
    GetAdminCoursesPayload,
    GetPendingCoursesPayload,
    RejectCoursePayload,
    PreviewCourseQuizPayload
} from '../interfaces/admin-courses.interface';

@Injectable()
export class AdminCoursesService {
    private readonly logger = new Logger(AdminCoursesService.name);

    constructor(
        private readonly coursesRepo: CoursesRepository,
        private readonly coursesService: CoursesService,
        private readonly mailService: MailService,
        private readonly eventEmitter: EventEmitter2,
        private readonly examGeneratorService: ExamGeneratorService,
    ) { }

    async getPendingCourses(payload: GetPendingCoursesPayload) {
        const { page, limit } = payload;
        const skip = (page - 1) * limit;

        const filter = { status: CourseStatus.PENDING_REVIEW };

        const [items, totalItems] = await Promise.all([
            this.coursesRepo.modelInstance.find(filter)
                .select('title slug price teacherId submittedAt')
                .populate('teacherId', 'fullName email avatar')
                .sort({ submittedAt: 1 })
                .skip(skip)
                .limit(limit)
                .lean()
                .exec(),
            this.coursesRepo.modelInstance.countDocuments(filter)
        ]);

        const mappedItems = items.map(item => ({
            id: item._id.toString(),
            title: item.title,
            slug: item.slug,
            price: item.price,
            teacher: item.teacherId ? {
                id: (item.teacherId as any)._id.toString(),
                fullName: (item.teacherId as any).fullName,
                email: (item.teacherId as any).email,
                avatar: (item.teacherId as any).avatar,
            } : null,
            submittedAt: item.submittedAt
        }));

        return {
            items: mappedItems,
            meta: { page, limit, totalItems, totalPages: Math.ceil(totalItems / limit) || 1 }
        };
    }

    async getCourseDetailForReview(courseId: string) {
        if (!Types.ObjectId.isValid(courseId)) throw new BadRequestException('ID không hợp lệ.');

        const curriculum = await this.coursesRepo.getFullCourseCurriculum(courseId, { maskMediaUrls: false });
        if (!curriculum) throw new NotFoundException('Khóa học không tồn tại.');

        return curriculum;
    }

    async approveCourse(payload: ApproveCoursePayload) {
        const { courseId } = payload;

        const course = await this.coursesRepo.modelInstance
            .findById(courseId)
            .select('status title slug teacherId')
            .populate('teacherId', 'email fullName')
            .lean()
            .exec();

        if (!course) throw new NotFoundException('Khóa học không tồn tại.');
        if (course.status !== CourseStatus.PENDING_REVIEW) {
            throw new BadRequestException(`Không thể duyệt. Khóa học đang ở trạng thái: ${course.status}`);
        }

        await this.coursesRepo.updateByIdSafe(courseId, {
            $set: { status: CourseStatus.PUBLISHED }
        });

        await this.coursesService.clearCourseCache(course.slug);

        const teacher = course.teacherId as any;
        if (teacher && teacher.email) {
            this.mailService.sendCourseApproval(teacher.email, teacher.fullName, course.title);
        }

        this.eventEmitter.emit(CourseEventPattern.COURSE_APPROVED, {
            courseId: courseId,
            teacherId: teacher._id.toString(),
            courseTitle: course.title,
        } as CourseApprovedEventPayload);

        return { message: 'Đã duyệt khóa học thành công. Khóa học đã được Public.' };
    }

    async rejectCourse(payload: RejectCoursePayload) {
        const { courseId, reason } = payload;

        const course = await this.coursesRepo.modelInstance
            .findById(courseId)
            .select('status title teacherId')
            .populate('teacherId', 'email fullName')
            .lean()
            .exec();

        if (!course) throw new NotFoundException('Khóa học không tồn tại.');
        if (course.status !== CourseStatus.PENDING_REVIEW) {
            throw new BadRequestException(`Không thể từ chối. Khóa học đang ở trạng thái: ${course.status}`);
        }

        await this.coursesRepo.updateByIdSafe(courseId, {
            $set: {
                status: CourseStatus.REJECTED,
                rejectionReason: reason
            }
        });

        const teacher = course.teacherId as any;
        if (teacher && teacher.email) {
            this.mailService.sendCourseRejection(teacher.email, teacher.fullName, course.title, reason);
        }

        this.eventEmitter.emit(CourseEventPattern.COURSE_REJECTED, {
            courseId: courseId,
            teacherId: teacher._id.toString(),
            courseTitle: course.title,
            reason: reason,
        } as CourseRejectedEventPayload);

        return { message: 'Đã từ chối khóa học và lưu lại lý do.' };
    }

    async getAllCourses(payload: GetAdminCoursesPayload) {
        const { page, limit, search, status, teacherId } = payload;

        if (status === CourseStatus.DRAFT) {
            return {
                items: [],
                meta: { page, limit, totalItems: 0, totalPages: 1 }
            };
        }

        const skip = (page - 1) * limit;

        const filter: any = {
            status: { $ne: CourseStatus.DRAFT }
        };

        if (status) filter.status = status;

        if (teacherId && Types.ObjectId.isValid(teacherId)) {
            filter.teacherId = new Types.ObjectId(teacherId);
        }

        if (search) {
            const escapedKeyword = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            filter.$or = [
                { title: { $regex: escapedKeyword, $options: 'i' } },
                { slug: { $regex: escapedKeyword, $options: 'i' } }
            ];
        }

        const [items, totalItems] = await Promise.all([
            this.coursesRepo.modelInstance.find(filter)
                .select('title slug price status teacherId createdAt submittedAt')
                .populate('teacherId', 'fullName email avatar')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean()
                .exec(),
            this.coursesRepo.modelInstance.countDocuments(filter)
        ]);

        const mappedItems = items.map((item: any) => ({
            id: item._id.toString(),
            title: item.title,
            slug: item.slug,
            price: item.price,
            status: item.status,
            teacher: item.teacherId ? {
                id: item.teacherId._id.toString(),
                fullName: item.teacherId.fullName,
                email: item.teacherId.email,
                avatar: item.teacherId.avatar,
            } : null,
            createdAt: item.createdAt,
            submittedAt: item.submittedAt || null
        }));

        return {
            items: mappedItems,
            meta: { page, limit, totalItems, totalPages: Math.ceil(totalItems / limit) || 1 }
        };
    }

    async forceTakedownCourse(payload: ForceTakedownCoursePayload) {
        const { courseId, reason, adminId } = payload;

        const course = await this.coursesRepo.modelInstance
            .findById(courseId)
            .select('status title slug teacherId')
            .populate('teacherId', 'email fullName')
            .lean()
            .exec();

        if (!course) throw new NotFoundException('Khóa học không tồn tại.');

        if (course.status !== CourseStatus.PUBLISHED) {
            throw new BadRequestException(`Không thể thực thi. Khóa học này đang ở trạng thái: ${course.status}`);
        }

        const severeReason = `[GỠ KHẨN CẤP BỞI BQT]: ${reason}`;

        await this.coursesRepo.updateByIdSafe(courseId, {
            $set: {
                status: CourseStatus.REJECTED,
                rejectionReason: severeReason
            }
        });

        await this.coursesService.clearCourseCache(course.slug);

        this.logger.warn(`[AUDIT - TAKEDOWN] Admin_ID: ${adminId} đã gỡ khóa học Course_ID: ${courseId} ("${course.title}") với lý do: ${reason}`);

        const teacher = course.teacherId as any;
        if (teacher && teacher.email) {
            this.mailService.sendCourseRejection(teacher.email, teacher.fullName, course.title, severeReason);
        }

        this.eventEmitter.emit(CourseEventPattern.COURSE_REJECTED, {
            courseId: courseId,
            teacherId: teacher._id.toString(),
            courseTitle: course.title,
            reason: severeReason,
        } as CourseRejectedEventPayload);

        return { message: 'Đã gỡ khóa học khỏi hệ thống thành công. Cache đã được xóa.' };
    }

    async previewCourseQuiz(payload: PreviewCourseQuizPayload) {
        const { courseId, lessonId } = payload;

        const curriculum = await this.coursesRepo.getFullCourseCurriculum(courseId, { maskMediaUrls: false });
        if (!curriculum) throw new NotFoundException('Khóa học không tồn tại.');

        const teacherId = curriculum.teacherId;
        if (!teacherId) throw new BadRequestException('Dữ liệu khóa học bị lỗi: Không tìm thấy tác giả.');

        let targetLesson: any = null;
        for (const section of curriculum.sections) {
            targetLesson = section.lessons.find((l: any) => l.id === lessonId);
            if (targetLesson) break;
        }

        if (!targetLesson) {
            throw new NotFoundException('Bài học không tồn tại trong khóa học này.');
        }

        if (!targetLesson.examId) {
            throw new BadRequestException('Bài học này không có cấu hình bài thi.');
        }

        const dynamicConfig = targetLesson.dynamicConfig;
        if (!dynamicConfig || (!dynamicConfig.matrixId && (!dynamicConfig.adHocSections || dynamicConfig.adHocSections.length === 0))) {
            throw new BadRequestException('Bài thi chưa được cấu hình Ma trận đề (Dynamic Config).');
        }

        this.logger.log(`[Admin Proxy] Admin is impersonating Teacher ${teacherId} to preview Quiz ${lessonId} of Course ${courseId}`);

        return this.examGeneratorService.previewDynamicExam({
            teacherId: teacherId, 
            matrixId: dynamicConfig.matrixId || undefined,
            adHocSections: dynamicConfig.adHocSections || undefined,
        });
    }
}