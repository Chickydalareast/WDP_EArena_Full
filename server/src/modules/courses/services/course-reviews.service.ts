import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CoursesRepository } from '../courses.repository';
import { EnrollmentsRepository } from '../repositories/enrollments.repository';
import { CourseReviewsRepository } from '../repositories/course-reviews.repository';
import {
  CreateCourseReviewPayload,
  GetCourseReviewsPayload,
  ReplyCourseReviewPayload,
} from '../interfaces/course.interface';
import { RedisService } from '../../../common/redis/redis.service';
import { CourseStatus } from '../schemas/course.schema';
import { EnrollmentStatus } from '../schemas/enrollment.schema';
import {
  CourseEventPattern,
  CourseReviewedEventPayload,
  ReviewRepliedEventPayload,
} from '../constants/course-event.constant';

@Injectable()
export class CourseReviewsService {
  private readonly logger = new Logger(CourseReviewsService.name);

  constructor(
    private readonly coursesRepo: CoursesRepository,
    private readonly enrollmentsRepo: EnrollmentsRepository,
    private readonly reviewsRepo: CourseReviewsRepository,
    private readonly redisService: RedisService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private async clearCourseCache(slug: string) {
    try {
      await this.redisService.del(`course:detail:${slug}`);
      const redisClient =
        (this.redisService as any).redisClient ||
        (this.redisService as any).redis;
      if (redisClient) {
        const keys = await redisClient.keys('courses:public:*');
        if (keys.length > 0) await redisClient.del(...keys);
      }
    } catch (error) {
      this.logger.error(
        `[Cache Error] Lỗi khi xóa cache khóa học ${slug}:`,
        error,
      );
    }
  }

  async createReview(payload: CreateCourseReviewPayload) {
    if (!Types.ObjectId.isValid(payload.courseId)) {
      throw new BadRequestException('ID khóa học không hợp lệ.');
    }

    // Lấy thêm teacherId và title để làm Data bắn Event
    const course = await this.coursesRepo.findByIdSafe(payload.courseId, {
      select: 'status slug teacherId title',
    });
    if (!course || course.status !== CourseStatus.PUBLISHED) {
      throw new NotFoundException('Khóa học không tồn tại hoặc chưa xuất bản.');
    }

    const enrollment = await this.enrollmentsRepo.findUserEnrollment(
      payload.userId,
      payload.courseId,
    );

    if (!enrollment || enrollment.status !== EnrollmentStatus.ACTIVE) {
      throw new ForbiddenException(
        'Bạn phải ghi danh khóa học này trước khi để lại đánh giá.',
      );
    }

    if (enrollment.progress === 0) {
      throw new ForbiddenException(
        'Bạn cần trải nghiệm ít nhất một bài học (progress > 0%) trước khi đưa ra đánh giá.',
      );
    }

    const statsResult = await this.coursesRepo.executeInTransaction(
      async () => {
        try {
          await this.reviewsRepo.createDocument({
            courseId: new Types.ObjectId(payload.courseId),
            userId: new Types.ObjectId(payload.userId),
            rating: payload.rating,
            comment: payload.comment,
          });
        } catch (error: any) {
          if (error.code === 11000) {
            throw new BadRequestException(
              'Bạn đã gửi đánh giá cho khóa học này rồi. Không thể đánh giá thêm.',
            );
          }
          throw error;
        }

        const stats = await this.reviewsRepo.calculateAverageRating(
          payload.courseId,
        );

        await this.coursesRepo.updateByIdSafe(payload.courseId, {
          $set: {
            averageRating: stats.averageRating,
            totalReviews: stats.totalReviews,
          },
        });

        return stats;
      },
    );

    await this.clearCourseCache(course.slug);

    // Học viên đánh giá -> Báo cho Giáo viên
    this.eventEmitter.emit(CourseEventPattern.COURSE_REVIEWED, {
      courseId: payload.courseId,
      teacherId: course.teacherId.toString(),
      studentId: payload.userId,
      courseTitle: course.title,
      rating: payload.rating,
    } as CourseReviewedEventPayload);

    return {
      message: 'Cảm ơn bạn đã đánh giá khóa học!',
      stats: statsResult,
    };
  }

  async replyReview(payload: ReplyCourseReviewPayload) {
    if (!Types.ObjectId.isValid(payload.reviewId)) {
      throw new BadRequestException('ID bài đánh giá không hợp lệ.');
    }

    // Lấy thêm userId (ID người viết review ban đầu)
    const review = await this.reviewsRepo.findByIdSafe(payload.reviewId, {
      select: 'courseId userId',
    });
    if (!review) {
      throw new NotFoundException('Không tìm thấy bài đánh giá này.');
    }

    // Kéo title để bắn notification
    const course = await this.coursesRepo.findByIdSafe(review.courseId, {
      select: 'teacherId slug title',
    });
    if (!course) {
      throw new NotFoundException(
        'Khóa học liên kết với đánh giá không tồn tại.',
      );
    }

    if (course.teacherId.toString() !== payload.teacherId) {
      throw new ForbiddenException(
        'Bạn không có quyền phản hồi bài đánh giá của khóa học này.',
      );
    }

    await this.reviewsRepo.updateByIdSafe(payload.reviewId, {
      $set: {
        teacherReply: payload.reply,
        repliedAt: new Date(),
      },
    });

    await this.clearCourseCache(course.slug);

    // Giáo viên reply -> Báo cho Học sinh
    this.eventEmitter.emit(CourseEventPattern.REVIEW_REPLIED, {
      reviewId: payload.reviewId,
      courseId: review.courseId.toString(),
      studentId: review.userId.toString(),
      teacherId: payload.teacherId,
      courseTitle: course.title,
    } as ReviewRepliedEventPayload);

    return {
      message: 'Đã lưu phản hồi của bạn cho học viên này.',
    };
  }

  async getReviews(payload: GetCourseReviewsPayload) {
    if (!Types.ObjectId.isValid(payload.courseId)) {
      throw new BadRequestException('ID khóa học không hợp lệ.');
    }

    const result = await this.reviewsRepo.getCourseReviewsPaginated(
      payload.courseId,
      payload.page,
      payload.limit,
    );

    return {
      items: result.items,
      meta: {
        totalItems: result.total,
        currentPage: payload.page,
        itemsPerPage: payload.limit,
        totalPages: Math.ceil(result.total / payload.limit) || 1,
      },
    };
  }
}
