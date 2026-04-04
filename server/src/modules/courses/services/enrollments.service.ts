import {
  Injectable,
  Logger,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EnrollmentsRepository } from '../repositories/enrollments.repository';
import { LessonsRepository } from '../repositories/lessons.repository';
import { CoursesRepository } from '../courses.repository';
import { CreateEnrollmentPayload } from '../interfaces/course.interface';
import {
  CourseEventPattern,
  CourseCompletedEventPayload,
} from '../constants/course-event.constant';

export type EnrollUserPayload = {
  userId: string;
  courseId: string;
};

export type MarkLessonPayload = {
  userId: string;
  courseId: string;
  lessonId: string;
};

@Injectable()
export class EnrollmentsService {
  constructor(
    private readonly enrollmentsRepo: EnrollmentsRepository,
    private readonly lessonsRepo: LessonsRepository,
    private readonly coursesRepo: CoursesRepository,
    private readonly eventEmitter: EventEmitter2,
  ) { }

  async validateCourseExamAccess(
    userId: string,
    courseId: string,
    lessonId: string,
  ): Promise<boolean> {
    if (!Types.ObjectId.isValid(courseId) || !Types.ObjectId.isValid(lessonId)) {
      throw new BadRequestException('ID khóa học hoặc bài học không hợp lệ.');
    }

    const lesson = await this.lessonsRepo.findOneSafe(
      {
        courseId: new Types.ObjectId(courseId),
        _id: new Types.ObjectId(lessonId),
      },
      { select: 'isFreePreview' },
    );

    if (!lesson) {
      throw new ForbiddenException(
        'Phát hiện truy cập trái phép! Bài thi không thuộc khóa học này.',
      );
    }

    if (lesson.isFreePreview) return true;

    const course = await this.coursesRepo.findByIdSafe(courseId, {
      select: 'teacherId',
    });
    if (course && course.teacherId.toString() === userId) return true;

    const enrollment = await this.enrollmentsRepo.findUserEnrollment(
      userId,
      courseId,
    );
    if (enrollment && (enrollment as any).status === 'ACTIVE') return true;

    throw new ForbiddenException(
      'Bạn chưa ghi danh khóa học này. Vui lòng nâng cấp để làm bài thi.',
    );
  }

  async createEnrollment(payload: CreateEnrollmentPayload) {
    const enrollment = await this.enrollmentsRepo.createDocument({
      userId: new Types.ObjectId(payload.userId),
      courseId: new Types.ObjectId(payload.courseId),
      completedLessons: [],
      progress: 0,
    });
    return { id: enrollment._id.toString() };
  }

  async markLessonCompleted(payload: MarkLessonPayload) {
    const enrollment = await this.enrollmentsRepo.findUserEnrollment(
      payload.userId,
      payload.courseId,
    );
    if (!enrollment)
      throw new ForbiddenException('Bạn chưa ghi danh khóa học này.');

    const lessonObjectId = new Types.ObjectId(payload.lessonId);

    const isAlreadyCompleted = enrollment.completedLessons.some(
      (id) => id.toString() === lessonObjectId.toString(),
    );
    if (isAlreadyCompleted) {
      return {
        message: 'Bài học đã được hoàn thành trước đó.',
        progress: enrollment.progress,
      };
    }

    const totalLessons = await this.lessonsRepo.countLessonsByCourse(
      payload.courseId,
    );
    if (totalLessons === 0)
      return { message: 'Khóa học chưa có bài học nào.', progress: 0 };

    const updated = await this.enrollmentsRepo.atomicUpdateProgress(
      enrollment._id,
      lessonObjectId,
      totalLessons,
    );

    const finalProgress = updated?.progress || 0;

    if (finalProgress === 100 && enrollment.progress < 100) {
      this.eventEmitter.emit(CourseEventPattern.COURSE_COMPLETED, {
        userId: payload.userId,
        courseId: payload.courseId,
        completedAt: new Date(),
      } as CourseCompletedEventPayload);
    }

    return { message: 'Đã lưu tiến độ.', progress: finalProgress };
  }
}