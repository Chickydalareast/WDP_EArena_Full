import {
  Injectable,
  Logger,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
  ForbiddenException
} from '@nestjs/common';
import { Types } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CoursesRepository } from './courses.repository';
import { CourseStatus } from './schemas/course.schema';
import { SectionsRepository } from './repositories/sections.repository';
import { LessonsRepository } from './repositories/lessons.repository';
import { RedisService } from '../../common/redis/redis.service';
import { UsersRepository } from '../users/users.repository';
import { MediaRepository } from '../media/media.repository';
import { MediaStatus } from '../media/schemas/media.schema';
import { CourseValidatorService } from './services/course-validator.service';
import { CourseDeactivatedEventPayload, CourseEventPattern, CourseSubmittedEventPayload } from './constants/course-event.constant';
import { EnrollmentsRepository } from './repositories/enrollments.repository';
import { EnrollmentStatus } from './schemas/enrollment.schema';

import { CourseReviewsRepository } from './repositories/course-reviews.repository';
import { WalletTransactionsRepository } from '../wallets/wallet-transactions.repository';

export type CreateCoursePayload = {
  title: string;
  price: number;
  description?: string;
  teacherId: string;
  subjectId?: string;
  progressionMode?: string;
  isStrictExam?: boolean;
};

export type UpdateCoursePayload = {
  courseId: string;
  teacherId: string;
  title?: string;
  price?: number;
  discountPrice?: number;
  description?: string;
  benefits?: string[];
  requirements?: string[];
  coverImageId?: string | null;
  promotionalVideoId?: string | null;
  progressionMode?: string;
  isStrictExam?: boolean;
};

@Injectable()
export class CoursesService {
  private readonly logger = new Logger(CoursesService.name);

  constructor(
    private readonly sectionsRepo: SectionsRepository,
    private readonly lessonsRepo: LessonsRepository,
    private readonly coursesRepo: CoursesRepository,
    private readonly redisService: RedisService,
    private readonly usersRepo: UsersRepository,
    private readonly mediaRepo: MediaRepository,
    private readonly validatorService: CourseValidatorService,
    private readonly eventEmitter: EventEmitter2,
    private readonly enrollmentsRepo: EnrollmentsRepository,
    private readonly courseReviewsRepo: CourseReviewsRepository,
    private readonly walletTransactionsRepo: WalletTransactionsRepository
  ) { }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  }

  public async clearCourseCache(slug: string) {
    try {
      const pipeline = this.redisService.getPipeline();

      pipeline.unlink(`course:detail:${slug}`);
      pipeline.unlink(`course:detail:v2:${slug}`);
      await pipeline.exec();

      this.clearPublicListCacheBackground().catch(err => {
        this.logger.error(`[Background Cache Sweeper] Lỗi chạy ngầm:`, err);
      });

      this.logger.debug(`[Cache Invalidation] Đã trigger dọn dẹp an toàn cho course: ${slug}`);
    } catch (error) {
      this.logger.error(`[Cache Error] Lỗi khi xóa cache khóa học ${slug}:`, error);
    }
  }

  private async clearPublicListCacheBackground() {
    const TAG_KEY = 'cache_tags:courses:public';
    const publicKeys = await this.redisService.smembers(TAG_KEY);

    if (publicKeys.length === 0) return;

    const CHUNK_SIZE = 500;
    for (let i = 0; i < publicKeys.length; i += CHUNK_SIZE) {
      const chunk = publicKeys.slice(i, i + CHUNK_SIZE);
      const pipeline = this.redisService.getPipeline();
      pipeline.unlink(...chunk);
      await pipeline.exec();
    }

    const finalPipeline = this.redisService.getPipeline();
    finalPipeline.unlink(TAG_KEY);
    await finalPipeline.exec();

    this.logger.debug(`[Background Cache Sweeper] Đã dọn dẹp thành công ${publicKeys.length} list queries.`);
  }

  async createCourse(payload: CreateCoursePayload): Promise<{ id: string; slug: string }> {
    const { title, teacherId, price, description, progressionMode, isStrictExam } = payload;

    if (!Types.ObjectId.isValid(teacherId)) {
      throw new BadRequestException('ID giáo viên không hợp lệ.');
    }

    const teacher = await this.usersRepo.findByIdSafe(teacherId, { select: 'subjectIds' });

    if (!teacher || !teacher.subjectIds || teacher.subjectIds.length === 0) {
      throw new BadRequestException('Giáo viên chưa được cấu hình bộ môn chuyên trách. Vui lòng cập nhật hồ sơ trước khi tạo khóa học.');
    }
    const autoMappedSubjectId = teacher.subjectIds[0];

    const baseSlug = this.generateSlug(title);
    let finalSlug = baseSlug;
    let retryCount = 0;
    const MAX_RETRIES = 3;

    while (retryCount < MAX_RETRIES) {
      try {
        const courseData = {
          title,
          slug: finalSlug,
          price,
          description,
          teacherId: new Types.ObjectId(teacherId),
          subjectId: autoMappedSubjectId,
          // [ENTERPRISE UPGRADE]: Ghi nhận cấu hình, nếu không có thì mặc định lấy FREE/false
          progressionMode: progressionMode || 'FREE',
          isStrictExam: isStrictExam ?? false,
        };

        const createdCourse = await this.coursesRepo.createDocument(courseData);
        return {
          id: (createdCourse._id as Types.ObjectId).toString(),
          slug: createdCourse.slug
        };
      } catch (error: unknown) {
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) {
          retryCount++;
          finalSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 8)}`;
          continue;
        }
        this.logger.error(`Lỗi tạo khóa học: ${error instanceof Error ? error.message : 'Unknown'}`);
        throw new InternalServerErrorException('Không thể khởi tạo khóa học.');
      }
    }

    throw new ConflictException('Không thể tạo đường dẫn duy nhất cho khóa học này. Vui lòng đổi tên khác.');
  }

  private async verifyMediaOwnershipStrict(mediaIds: (string | null | undefined)[], teacherId: string): Promise<void> {
    const validIds = mediaIds.filter((id): id is string => !!id && Types.ObjectId.isValid(id));
    if (validIds.length === 0) return;

    const medias = await this.mediaRepo.modelInstance.find({
      _id: { $in: validIds.map(id => new Types.ObjectId(id)) }
    }).lean().select('uploadedBy status originalName').exec();

    if (medias.length !== validIds.length) {
      throw new BadRequestException('Một hoặc nhiều tệp đính kèm không tồn tại trong hệ thống.');
    }

    for (const media of medias) {
      if (media.uploadedBy.toString() !== teacherId) {
        this.logger.warn(`[SECURITY ALERT] User ${teacherId} cố gắng gán Media ${media._id} của người khác!`);
        throw new ForbiddenException(`Tệp tin "${media.originalName}" không thuộc quyền sở hữu của bạn.`);
      }
      if (media.status !== MediaStatus.READY) {
        throw new BadRequestException(`Tệp tin "${media.originalName}" đang xử lý hoặc bị lỗi, chưa thể sử dụng.`);
      }
    }
  }

  async updateCourse(payload: UpdateCoursePayload) {
    const { courseId, teacherId, ...updateData } = payload;

    if (!Types.ObjectId.isValid(courseId)) throw new BadRequestException('ID khóa học không hợp lệ.');

    const course = await this.coursesRepo.findByIdSafe(courseId, {
      select: 'teacherId slug status title progressionMode isStrictExam'
    });

    if (!course) throw new NotFoundException('Khóa học không tồn tại.');
    if (course.teacherId.toString() !== teacherId) throw new ForbiddenException('Bạn không có quyền sửa khóa học này.');

    if (course.status === CourseStatus.PENDING_REVIEW) {
      throw new ForbiddenException('Khóa học đang trong quá trình xét duyệt, bạn không thể chỉnh sửa nội dung lúc này.');
    }

    const isChangingProgression = updateData.progressionMode !== undefined && updateData.progressionMode !== course.progressionMode;
    const isChangingStrictExam = updateData.isStrictExam !== undefined && updateData.isStrictExam !== course.isStrictExam;

    if (isChangingProgression || isChangingStrictExam) {
      const studentCount = await this.enrollmentsRepo.modelInstance.countDocuments({
        courseId: new Types.ObjectId(courseId),
        status: EnrollmentStatus.ACTIVE
      });

      if (studentCount > 0) {
        throw new ForbiddenException(
          'Hành động bị từ chối! Không thể thay đổi Chế độ học tập hoặc Cấu hình thi khi khóa học đã có học viên ghi danh, nhằm tránh gây lỗi tiến độ học của hệ thống.'
        );
      }
    }

    const mediaToVerify = [updateData.coverImageId, updateData.promotionalVideoId];
    // Giả định hàm verifyMediaOwnershipStrict nằm trong validatorService hoặc service này
    await this.validatorService.verifyMediaOwnershipStrict(mediaToVerify, teacherId);

    const sanitizedUpdate = Object.keys(updateData).reduce((acc, key) => {
      const k = key as keyof Omit<UpdateCoursePayload, 'courseId' | 'teacherId'>;
      if (updateData[k] !== undefined) acc[k] = updateData[k] as any;
      return acc;
    }, {} as any);

    if (sanitizedUpdate.coverImageId !== undefined) {
      sanitizedUpdate.coverImageId = sanitizedUpdate.coverImageId ? new Types.ObjectId(sanitizedUpdate.coverImageId) : null;
    }

    if (sanitizedUpdate.promotionalVideoId !== undefined) {
      sanitizedUpdate.promotionalVideoId = sanitizedUpdate.promotionalVideoId ? new Types.ObjectId(sanitizedUpdate.promotionalVideoId) : null;
    }

    const updated = await this.coursesRepo.updateByIdSafe(courseId, { $set: sanitizedUpdate });

    this.clearCourseCache(course.slug);

    return updated;
  }

  async submitCourseForReview(courseId: string, teacherId: string) {
    let finalSlug = '';
    let courseTitle = '';

    await this.coursesRepo.executeInTransaction(async () => {
      const course = await this.coursesRepo.findByIdSafe(courseId);

      if (!course) throw new NotFoundException('Khóa học không tồn tại.');
      if (course.teacherId.toString() !== teacherId) {
        throw new ForbiddenException('Bạn không có quyền gửi duyệt khóa học này.');
      }

      if (course.status === CourseStatus.PENDING_REVIEW) {
        throw new BadRequestException('Khóa học này đã được gửi đi và đang chờ Admin duyệt.');
      }
      if (course.status === CourseStatus.PUBLISHED) {
        throw new BadRequestException('Khóa học này đã được xuất bản công khai.');
      }
      if (course.price === undefined || course.price < 0) {
        throw new BadRequestException('Khóa học chưa được thiết lập giá.');
      }

      finalSlug = course.slug;
      courseTitle = course.title;

      await this.validatorService.validateCourseSubmissionRules({
        courseId,
        teacherId,
        price: course.price
      });

      const hasSection = await this.sectionsRepo.findOneSafe(
        { courseId: new Types.ObjectId(courseId) },
        { select: '_id' }
      );
      if (!hasSection) throw new BadRequestException('Khóa học phải có ít nhất 1 chương.');

      const hasLesson = await this.lessonsRepo.findOneSafe(
        { courseId: new Types.ObjectId(courseId) },
        { select: '_id' }
      );
      if (!hasLesson) throw new BadRequestException('Khóa học phải có ít nhất 1 bài học.');

      await this.coursesRepo.updateByIdSafe(courseId, {
        $set: {
          status: CourseStatus.PENDING_REVIEW,
          submittedAt: new Date(),
          rejectionReason: null
        }
      });
    });

    if (finalSlug) {
      this.clearCourseCache(finalSlug);
    }

    this.eventEmitter.emit(CourseEventPattern.COURSE_SUBMITTED, {
      courseId,
      teacherId,
      courseTitle
    } as CourseSubmittedEventPayload);

    return { message: 'Đã gửi yêu cầu xuất bản. Vui lòng chờ Admin xét duyệt.' };
  }


  async deleteCourse(courseId: string, teacherId: string) {
    const course = await this.coursesRepo.findByIdSafe(courseId, { select: 'teacherId slug status' });
    if (!course) throw new NotFoundException('Khóa học không tồn tại.');
    if (course.teacherId.toString() !== teacherId) throw new ForbiddenException('Bạn không có quyền thao tác trên khóa học này.');

    const studentCount = await this.enrollmentsRepo.modelInstance.countDocuments({
      courseId: new Types.ObjectId(courseId),
      status: EnrollmentStatus.ACTIVE
    });

    if (course.status !== CourseStatus.DRAFT || studentCount > 0) {
      await this.coursesRepo.updateByIdSafe(courseId, { $set: { status: CourseStatus.ARCHIVED } });
      this.eventEmitter.emit(CourseEventPattern.COURSE_STATUS_DEACTIVATED, {
        courseId,
        reason: 'ARCHIVED',
      } as CourseDeactivatedEventPayload);
      this.clearCourseCache(course.slug);
      return {
        message: 'Khóa học đã được chuyển sang trạng thái Lưu trữ (Archived) nhằm bảo vệ quyền lợi của học viên đã mua.'
      };
    }

    await this.coursesRepo.executeInTransaction(async () => {
      await this.lessonsRepo.deleteManySafe({ courseId: new Types.ObjectId(courseId) });
      await this.sectionsRepo.deleteManySafe({ courseId: new Types.ObjectId(courseId) });
      await this.coursesRepo.deleteOneSafe({ _id: new Types.ObjectId(courseId) });
    });

    this.clearCourseCache(course.slug);

    return { message: 'Đã xóa vĩnh viễn khóa học bản nháp và toàn bộ giáo án.' };
  }

  async getMyCourses(teacherId: string) {
    const courses = await this.coursesRepo.getTeacherCoursesWithMetrics(teacherId);
    return courses;
  }

  async getTeacherCourseDetail(courseId: string, teacherId: string) {
    if (!Types.ObjectId.isValid(courseId)) throw new BadRequestException('ID không hợp lệ.');

    const course: any = await this.coursesRepo.getCourseDetailById(courseId);

    if (!course) throw new NotFoundException('Khóa học không tồn tại.');
    if (course.teacherId.toString() !== teacherId) throw new ForbiddenException('Bạn không có quyền xem khóa học này.');

    const { _id, teacherId: tId, coverImageId, promotionalVideoId, ...rest } = course;

    return {
      id: _id.toString(),
      teacherId: tId.toString(),
      coverImage: coverImageId ? { id: coverImageId._id.toString(), url: coverImageId.url, blurHash: coverImageId.blurHash } : null,
      promotionalVideo: promotionalVideoId ? { id: promotionalVideoId._id.toString(), url: promotionalVideoId.url, blurHash: promotionalVideoId.blurHash } : null,
      ...rest
    };
  }

  async getTeacherCourseCurriculum(courseId: string, teacherId: string) {
    if (!Types.ObjectId.isValid(courseId)) throw new BadRequestException('ID khóa học không hợp lệ.');

    const course = await this.coursesRepo.findByIdSafe(courseId, { select: 'teacherId' });
    if (!course) throw new NotFoundException('Khóa học không tồn tại.');
    if (course.teacherId.toString() !== teacherId) {
      throw new ForbiddenException('Bạn không có quyền xem cấu trúc khóa học này.');
    }

    const curriculum = await this.coursesRepo.getFullCourseCurriculum(courseId, { maskMediaUrls: false });
    return curriculum;
  }

  async getTeacherCourseStats(courseId: string, teacherId: string) {
    if (!Types.ObjectId.isValid(courseId)) throw new BadRequestException('ID khóa học không hợp lệ.');

    // [PERFORMANCE TUNE]: Check Cache Redis (TTL: 5 phút) để tránh Hammering DB mỗi khi F5
    const cacheKey = `teacher:dashboard:stats:${courseId}`;
    const cachedStats = await this.redisService.get(cacheKey);
    if (cachedStats) {
      return JSON.parse(cachedStats);
    }

    const course = await this.coursesRepo.findByIdSafe(courseId, {
      select: 'teacherId averageRating totalReviews'
    });

    if (!course) throw new NotFoundException('Khóa học không tồn tại.');
    if (course.teacherId.toString() !== teacherId) {
      throw new ForbiddenException('Bạn không có quyền truy cập thống kê này.');
    }

    // [CTO UPGRADE]: Chạy song song 4 truy vấn nặng để tối đa hóa hiệu suất I/O
    const [studentCount, averageProgress, pendingReviews, totalRevenue] = await Promise.all([
      this.enrollmentsRepo.modelInstance.countDocuments({
        courseId: new Types.ObjectId(courseId),
        status: EnrollmentStatus.ACTIVE
      }),
      this.enrollmentsRepo.getCourseAverageProgress(courseId),
      this.courseReviewsRepo.countUnrepliedReviews(courseId),
      this.walletTransactionsRepo.calculateTotalRevenueByCourse(courseId)
    ]);

    const stats = {
      totalStudents: studentCount,
      averageProgress: Math.round(averageProgress * 10) / 10,
      averageRating: course.averageRating || 0,
      totalReviews: course.totalReviews || 0,
      pendingReviews: pendingReviews,
      totalRevenue: totalRevenue
    };

    await this.redisService.set(cacheKey, JSON.stringify(stats), 300);

    return stats;
  }
}