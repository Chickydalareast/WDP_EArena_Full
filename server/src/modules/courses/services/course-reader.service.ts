import { Injectable, Logger, NotFoundException, ForbiddenException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { Types } from 'mongoose';
import { CoursesRepository, SearchPublicCoursesOptions } from '../courses.repository';
import { EnrollmentsRepository } from '../repositories/enrollments.repository';
import { LessonsRepository } from '../repositories/lessons.repository';
import { RedisService } from '../../../common/redis/redis.service';
import { MediaService } from '../../media/media.service';
import { CourseSortType } from '../enums/course-search.enum';
import { CourseReviewsRepository } from '../repositories/course-reviews.repository';
import { LessonProgressRepository } from '../repositories/lesson-progress.repository';
import { ProgressionLockedException } from '../exceptions/progression-locked.exception';

export type SearchPublicCoursesPayload = {
  keyword?: string;
  subjectId?: string;
  page: number;
  limit: number;
  isFree?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sort?: CourseSortType;
  userId?: string;
};

export type GetStudyTreePayload = {
  courseId: string;
  userId: string;
};

export type GetLessonContentPayload = {
  courseId: string;
  lessonId: string;
  userId: string;
};

export type GetMyLearningPayload = {
  userId: string;
  page: number;
  limit: number;
};

@Injectable()
export class CourseReaderService {
  private readonly logger = new Logger(CourseReaderService.name);

  constructor(
    private readonly coursesRepo: CoursesRepository,
    private readonly enrollmentsRepo: EnrollmentsRepository,
    private readonly lessonsRepo: LessonsRepository,
    private readonly redisService: RedisService,
    private readonly mediaService: MediaService,
    private readonly reviewsRepo: CourseReviewsRepository,
    private readonly lessonProgressRepo: LessonProgressRepository, // [CẬP NHẬT]: Inject Repo
  ) { }

  async searchPublicCourses(payload: SearchPublicCoursesPayload) {
    const { userId, ...dbOptions } = payload;
    
    const cacheIdentifier = [
      dbOptions.keyword ? `k_${dbOptions.keyword}` : '',
      dbOptions.subjectId ? `s_${dbOptions.subjectId}` : '',
      dbOptions.isFree !== undefined ? `f_${dbOptions.isFree}` : '',
      dbOptions.minPrice !== undefined ? `min_${dbOptions.minPrice}` : '',
      dbOptions.maxPrice !== undefined ? `max_${dbOptions.maxPrice}` : '',
      dbOptions.sort ? `sort_${dbOptions.sort}` : '',
      `p_${dbOptions.page}`,
      `l_${dbOptions.limit}`
    ].filter(Boolean).join(':');

    const cacheKey = `courses:public:${cacheIdentifier}`;
    const TAG_KEY = 'cache_tags:courses:public';
    let baseResult: any = null;

    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      this.logger.debug(`[Cache Hit] Trả về danh sách khóa học public: ${cacheKey}`);
      baseResult = JSON.parse(cached);
    } else {
      baseResult = await this.coursesRepo.searchPublicCourses(dbOptions as SearchPublicCoursesOptions);

      if (baseResult.data.length > 0) {
        const pipeline = this.redisService.getPipeline();
        pipeline.set(cacheKey, JSON.stringify(baseResult), 'EX', 300);
        pipeline.sadd(TAG_KEY, cacheKey);
        pipeline.expire(TAG_KEY, 86400)
        await pipeline.exec();
      }
    }

    if (payload.userId && baseResult.data.length > 0) {
      const courseIds = baseResult.data.map((c: any) => new Types.ObjectId(c.id));

      const userEnrollments = await this.enrollmentsRepo.modelInstance.find({
        userId: new Types.ObjectId(payload.userId),
        courseId: { $in: courseIds },
        status: 'ACTIVE'
      }).lean().select('courseId').exec();

      const enrolledCourseIds = new Set(userEnrollments.map(e => e.courseId.toString()));

      baseResult.data = baseResult.data.map((course: any) => ({
        ...course,
        isEnrolled: (course.teacher && course.teacher.id === payload.userId) || enrolledCourseIds.has(course.id)
      }));
    } else {
      baseResult.data = baseResult.data.map((course: any) => ({
        ...course,
        isEnrolled: false
      }));
    }

    return baseResult;
  }

  async getPublicCourseDetail(slug: string, userId?: string) {
    const cacheKey = `course:detail:v2:${slug}`;
    let baseData: any = null;

    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      baseData = JSON.parse(cached);
    } else {
      const course = await this.coursesRepo.findBySlug(slug);
      if (!course || course.status !== 'PUBLISHED') {
        throw new NotFoundException('Khóa học không tồn tại hoặc chưa xuất bản.');
      }

      const curriculum = await this.coursesRepo.getFullCourseCurriculum(course.id, { maskMediaUrls: true });

      baseData = {
        course,
        curriculum
      };

      await this.redisService.set(cacheKey, JSON.stringify(baseData), 300);
    }

    let isEnrolled = false;

    if (userId) {
      if (baseData.course.teacher && baseData.course.teacher.id === userId) {
        isEnrolled = true;
      } else {
        const enrollment = await this.enrollmentsRepo.findUserEnrollment(userId, baseData.course.id);
        if (enrollment && enrollment.status === 'ACTIVE') {
          isEnrolled = true;
        }
      }
    }

    return {
      ...baseData,
      isEnrolled
    };
  }

  async getStudyTree(payload: GetStudyTreePayload) {
    if (!Types.ObjectId.isValid(payload.courseId)) throw new BadRequestException('ID khóa học không hợp lệ.');

    const course = await this.coursesRepo.findByIdSafe(payload.courseId, { select: 'teacherId' });
    if (!course) throw new NotFoundException('Khóa học không tồn tại.');

    const isTeacher = course.teacherId.toString() === payload.userId;

    let enrollment = null;
    let myReview = null; // [ENTERPRISE FIX]: Khởi tạo state review mặc định là null

    if (!isTeacher) {
      // 1. Kiểm tra quyền truy cập (Enrollment)
      enrollment = await this.enrollmentsRepo.findUserEnrollment(payload.userId, payload.courseId);
      if (!enrollment) throw new ForbiddenException('Bạn chưa ghi danh khóa học này.');

      // 2. [ENTERPRISE FIX]: Lấy bài đánh giá của user hiện tại (nếu có)
      // Dùng findOneSafe kết hợp select cực chặt để tối ưu RAM
      const reviewDoc = await this.reviewsRepo.findOneSafe({
        courseId: new Types.ObjectId(payload.courseId),
        userId: new Types.ObjectId(payload.userId)
      }, { select: 'rating comment teacherReply repliedAt createdAt' });

      if (reviewDoc) {
        myReview = {
          id: (reviewDoc._id as Types.ObjectId).toString(),
          rating: reviewDoc.rating,
          comment: reviewDoc.comment || null,
          teacherReply: reviewDoc.teacherReply || null,
          repliedAt: reviewDoc.repliedAt || null,
          createdAt: reviewDoc.createdAt,
        };
      }
    }

    const curriculum = await this.coursesRepo.getFullCourseCurriculum(payload.courseId, { maskMediaUrls: true });
    
    if (!curriculum) throw new NotFoundException('Khóa học bị lỗi cấu trúc.');

    const completedSet = new Set(enrollment ? enrollment.completedLessons.map(id => id.toString()) : []);

    if (curriculum.sections) {
      curriculum.sections = curriculum.sections.map((section: any) => ({
        ...section,
        lessons: section.lessons.map((lesson: any) => ({
          ...lesson,
          isCompleted: isTeacher ? true : completedSet.has(lesson.id),
        }))
      }));
    }

    return {
      progress: isTeacher ? 100 : (enrollment?.progress || 0),
      status: isTeacher ? 'ACTIVE' : (enrollment?.status || 'ACTIVE'),
      curriculum,
      myReview,
    };
  }

  async getLessonContent(payload: GetLessonContentPayload) {
    if (!Types.ObjectId.isValid(payload.courseId) || !Types.ObjectId.isValid(payload.lessonId)) {
      throw new BadRequestException('ID không hợp lệ.');
    }

    const lesson = await this.lessonsRepo.findByIdSafe(payload.lessonId, {
      populate: [
        { path: 'primaryVideoId', select: 'publicId url blurHash duration mimetype' },
        { path: 'attachments', select: 'publicId url originalName mimetype size' }
      ]
    });

    if (!lesson) throw new NotFoundException('Bài học không tồn tại.');
    if (lesson.courseId.toString() !== payload.courseId) {
      throw new BadRequestException('Bài học không thuộc khóa học này.');
    }

    let hasAccess = lesson.isFreePreview;

    if (!hasAccess) {
      const course = await this.coursesRepo.findByIdSafe(payload.courseId, { select: 'teacherId' });
      if (course && course.teacherId.toString() === payload.userId) {
        hasAccess = true;
      }
    }

    if (!hasAccess) {
      const enrollment = await this.enrollmentsRepo.findUserEnrollment(payload.userId, payload.courseId);
      if (enrollment && enrollment.status === 'ACTIVE') {
        hasAccess = true;
      }
    }

    if (!hasAccess) throw new ForbiddenException('Vui lòng ghi danh khóa học để xem nội dung này.');

    // ==========================================
    // [ENTERPRISE UPGRADE]: PROGRESSION GUARD
    // ==========================================
    // 1. Lấy thông tin Mode của Course (Lấy thêm teacherId để check quyền admin khóa học)
    const courseInfo = await this.coursesRepo.findByIdSafe(payload.courseId, { select: 'progressionMode teacherId' });
    const mode = courseInfo?.progressionMode || 'FREE';

    // 2. Nếu là STRICT_LINEAR và không phải Teacher đang test
    if (mode === 'STRICT_LINEAR' && courseInfo?.teacherId?.toString() !== payload.userId) {
      // Populate thêm để lấy thông tin order (Cập nhật truy vấn lesson cũ của bạn)
      const currentLesson = await this.lessonsRepo.findByIdSafe(payload.lessonId, {
        populate: [{ path: 'sectionId', select: 'order' }]
      });

      const sectionData = currentLesson?.sectionId as any;
      if (currentLesson && sectionData) {
        const prevLessonId = await this.lessonsRepo.getPreviousLessonId(
          payload.courseId,
          sectionData.order,
          currentLesson.order
        );

        if (prevLessonId) {
          const prevProgress = await this.lessonProgressRepo.findOneSafe({
            userId: new Types.ObjectId(payload.userId),
            lessonId: new Types.ObjectId(prevLessonId)
          }, { select: 'isCompleted' });

          if (!prevProgress || !prevProgress.isCompleted) {
            throw new ProgressionLockedException(prevLessonId);
          }
        }
      }
    }

    const primaryVideo = lesson.primaryVideoId as any;
    const attachments = (lesson.attachments || []) as any[];

    return {
      id: (lesson._id as Types.ObjectId).toString(),
      title: lesson.title,
      content: lesson.content || null,
      examId: lesson.examId ? lesson.examId.toString() : null,

      primaryVideo: primaryVideo ? {
        id: primaryVideo._id.toString(),
        url: this.mediaService.getSecureUrl(primaryVideo.publicId, primaryVideo.mimetype || 'video/mp4'),
        blurHash: primaryVideo.blurHash,
        duration: primaryVideo.duration || null,
      } : null,

      attachments: attachments.map(att => ({
        id: att._id.toString(),
        url: this.mediaService.getSecureUrl(att.publicId, att.mimetype),
        originalName: att.originalName,
        mimetype: att.mimetype,
        size: att.size || null,
      })),
    };
  }

  async getMyLearningCourses(payload: GetMyLearningPayload) {
    const { userId, page, limit } = payload;

    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('ID người dùng không hợp lệ.');
    }

    const { items, total } = await this.enrollmentsRepo.findMyCoursesPaginated(userId, page, limit);

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1
      }
    };
  }
}