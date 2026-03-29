import {
  Injectable,
  Logger,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CoursesRepository } from '../courses.repository';
import { EnrollmentsRepository } from '../repositories/enrollments.repository';
import { EnrollmentsService } from './enrollments.service';
import { WalletsService } from '../../wallets/wallets.service';
import { CourseStatus } from '../schemas/course.schema';
import { ReferenceType } from '../../wallets/schemas/wallet-transaction.schema';
import { CourseCheckoutPayload } from '../interfaces/course.interface';
import {
  CourseEventPattern,
  CoursePurchasedEventPayload,
  CourseSoldEventPayload
} from '../constants/course-event.constant';

@Injectable()
export class CourseCheckoutService {
  private readonly logger = new Logger(CourseCheckoutService.name);

  constructor(
    private readonly coursesRepo: CoursesRepository,
    private readonly enrollmentsRepo: EnrollmentsRepository,
    private readonly enrollmentsService: EnrollmentsService,
    private readonly walletsService: WalletsService,
    private readonly eventEmitter: EventEmitter2,
  ) { }

  async checkoutCourse(payload: CourseCheckoutPayload) {
    if (!Types.ObjectId.isValid(payload.courseId)) {
      throw new BadRequestException('Mã khóa học không hợp lệ.');
    }

    const course = await this.coursesRepo.findByIdSafe(payload.courseId, { select: 'status price title teacherId' });
    if (!course) throw new NotFoundException('Khóa học không tồn tại.');
    if (course.status !== CourseStatus.PUBLISHED) throw new BadRequestException('Khóa học chưa được xuất bản.');
    if (course.teacherId.toString() === payload.userId) throw new BadRequestException('Giáo viên không thể tự mua khóa học của mình.');

    let revenueEarned = 0;

    const transactionResult = await this.coursesRepo.executeInTransaction(async () => {

      const existing = await this.enrollmentsRepo.findUserEnrollment(payload.userId, payload.courseId);
      if (existing) throw new ConflictException('Bạn đã ghi danh khóa học này rồi.');

      if (course.price && course.price > 0) {
        // [CTO FIX]: Hứng kết quả doanh thu
        const paymentResult = await this.walletsService.processSplitPayment({
          buyerId: payload.userId,
          sellerId: course.teacherId.toString(),
          amount: course.price,
          referenceId: course._id as Types.ObjectId,
          referenceType: ReferenceType.COURSE,
          description: `Thanh toán khóa học: ${course.title}`,
        });
        revenueEarned = paymentResult.revenueAmount;
      }

      const enrollment = await this.enrollmentsService.createEnrollment({
        userId: payload.userId,
        courseId: payload.courseId,
      });

      return {
        message: course.price && course.price > 0
          ? 'Thanh toán và ghi danh khóa học thành công.'
          : 'Ghi danh khóa học miễn phí thành công.',
        enrollmentId: enrollment.id
      };
    });

    this.eventEmitter.emit(CourseEventPattern.COURSE_PURCHASED, {
      userId: payload.userId,
      courseId: payload.courseId,
      courseTitle: course.title
    } as CoursePurchasedEventPayload);

    if (course.price && course.price > 0) {
      this.eventEmitter.emit(CourseEventPattern.COURSE_SOLD, {
        teacherId: course.teacherId.toString(),
        studentId: payload.userId,
        courseId: payload.courseId,
        courseTitle: course.title,
        revenueAmount: revenueEarned,
      } as CourseSoldEventPayload);
    }

    return transactionResult;
  }
}