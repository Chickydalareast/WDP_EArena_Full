"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var CourseReaderService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseReaderService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("mongoose");
const courses_repository_1 = require("../courses.repository");
const enrollments_repository_1 = require("../repositories/enrollments.repository");
const lessons_repository_1 = require("../repositories/lessons.repository");
const redis_service_1 = require("../../../common/redis/redis.service");
const media_service_1 = require("../../media/media.service");
const course_reviews_repository_1 = require("../repositories/course-reviews.repository");
const lesson_progress_repository_1 = require("../repositories/lesson-progress.repository");
const progression_locked_exception_1 = require("../exceptions/progression-locked.exception");
let CourseReaderService = CourseReaderService_1 = class CourseReaderService {
    coursesRepo;
    enrollmentsRepo;
    lessonsRepo;
    redisService;
    mediaService;
    reviewsRepo;
    lessonProgressRepo;
    logger = new common_1.Logger(CourseReaderService_1.name);
    constructor(coursesRepo, enrollmentsRepo, lessonsRepo, redisService, mediaService, reviewsRepo, lessonProgressRepo) {
        this.coursesRepo = coursesRepo;
        this.enrollmentsRepo = enrollmentsRepo;
        this.lessonsRepo = lessonsRepo;
        this.redisService = redisService;
        this.mediaService = mediaService;
        this.reviewsRepo = reviewsRepo;
        this.lessonProgressRepo = lessonProgressRepo;
    }
    async searchPublicCourses(payload) {
        const { userId, ...dbOptions } = payload;
        const cacheIdentifier = [
            dbOptions.keyword ? `k_${dbOptions.keyword}` : '',
            dbOptions.subjectId ? `s_${dbOptions.subjectId}` : '',
            dbOptions.isFree !== undefined ? `f_${dbOptions.isFree}` : '',
            dbOptions.minPrice !== undefined ? `min_${dbOptions.minPrice}` : '',
            dbOptions.maxPrice !== undefined ? `max_${dbOptions.maxPrice}` : '',
            dbOptions.sort ? `sort_${dbOptions.sort}` : '',
            `p_${dbOptions.page}`,
            `l_${dbOptions.limit}`,
        ]
            .filter(Boolean)
            .join(':');
        const cacheKey = `courses:public:${cacheIdentifier}`;
        const TAG_KEY = 'cache_tags:courses:public';
        let baseResult = null;
        const cached = await this.redisService.get(cacheKey);
        if (cached) {
            this.logger.debug(`[Cache Hit] Trả về danh sách khóa học public: ${cacheKey}`);
            baseResult = JSON.parse(cached);
        }
        else {
            baseResult = await this.coursesRepo.searchPublicCourses(dbOptions);
            if (baseResult.data.length > 0) {
                const pipeline = this.redisService.getPipeline();
                pipeline.set(cacheKey, JSON.stringify(baseResult), 'EX', 300);
                pipeline.sadd(TAG_KEY, cacheKey);
                pipeline.expire(TAG_KEY, 86400);
                await pipeline.exec();
            }
        }
        if (payload.userId && baseResult.data.length > 0) {
            const courseIds = baseResult.data.map((c) => new mongoose_1.Types.ObjectId(c.id));
            const userEnrollments = await this.enrollmentsRepo.modelInstance
                .find({
                userId: new mongoose_1.Types.ObjectId(payload.userId),
                courseId: { $in: courseIds },
                status: 'ACTIVE',
            })
                .lean()
                .select('courseId')
                .exec();
            const enrolledCourseIds = new Set(userEnrollments.map((e) => e.courseId.toString()));
            baseResult.data = baseResult.data.map((course) => ({
                ...course,
                isEnrolled: (course.teacher && course.teacher.id === payload.userId) ||
                    enrolledCourseIds.has(course.id),
            }));
        }
        else {
            baseResult.data = baseResult.data.map((course) => ({
                ...course,
                isEnrolled: false,
            }));
        }
        return baseResult;
    }
    async getPublicCourseDetail(slug, userId) {
        const cacheKey = `course:detail:v2:${slug}`;
        let baseData = null;
        const cached = await this.redisService.get(cacheKey);
        if (cached) {
            baseData = JSON.parse(cached);
        }
        else {
            const course = await this.coursesRepo.findBySlug(slug);
            if (!course || course.status !== 'PUBLISHED') {
                throw new common_1.NotFoundException('Khóa học không tồn tại hoặc chưa xuất bản.');
            }
            const curriculum = await this.coursesRepo.getFullCourseCurriculum(course.id, { maskMediaUrls: true });
            baseData = {
                course,
                curriculum,
            };
            await this.redisService.set(cacheKey, JSON.stringify(baseData), 300);
        }
        let isEnrolled = false;
        if (userId) {
            if (baseData.course.teacher && baseData.course.teacher.id === userId) {
                isEnrolled = true;
            }
            else {
                const enrollment = await this.enrollmentsRepo.findUserEnrollment(userId, baseData.course.id);
                if (enrollment && enrollment.status === 'ACTIVE') {
                    isEnrolled = true;
                }
            }
        }
        return {
            ...baseData,
            isEnrolled,
        };
    }
    async getStudyTree(payload) {
        if (!mongoose_1.Types.ObjectId.isValid(payload.courseId))
            throw new common_1.BadRequestException('ID khóa học không hợp lệ.');
        const course = await this.coursesRepo.findByIdSafe(payload.courseId, {
            select: 'teacherId',
        });
        if (!course)
            throw new common_1.NotFoundException('Khóa học không tồn tại.');
        const isTeacher = course.teacherId.toString() === payload.userId;
        let enrollment = null;
        let myReview = null;
        if (!isTeacher) {
            enrollment = await this.enrollmentsRepo.findUserEnrollment(payload.userId, payload.courseId);
            if (!enrollment)
                throw new common_1.ForbiddenException('Bạn chưa ghi danh khóa học này.');
            const reviewDoc = await this.reviewsRepo.findOneSafe({
                courseId: new mongoose_1.Types.ObjectId(payload.courseId),
                userId: new mongoose_1.Types.ObjectId(payload.userId),
            }, { select: 'rating comment teacherReply repliedAt createdAt' });
            if (reviewDoc) {
                myReview = {
                    id: reviewDoc._id.toString(),
                    rating: reviewDoc.rating,
                    comment: reviewDoc.comment || null,
                    teacherReply: reviewDoc.teacherReply || null,
                    repliedAt: reviewDoc.repliedAt || null,
                    createdAt: reviewDoc.createdAt,
                };
            }
        }
        const curriculum = await this.coursesRepo.getFullCourseCurriculum(payload.courseId, { maskMediaUrls: true });
        if (!curriculum)
            throw new common_1.NotFoundException('Khóa học bị lỗi cấu trúc.');
        const completedSet = new Set(enrollment ? enrollment.completedLessons.map((id) => id.toString()) : []);
        if (curriculum.sections) {
            curriculum.sections = curriculum.sections.map((section) => ({
                ...section,
                lessons: section.lessons.map((lesson) => ({
                    ...lesson,
                    isCompleted: isTeacher ? true : completedSet.has(lesson.id),
                })),
            }));
        }
        return {
            progress: isTeacher ? 100 : enrollment?.progress || 0,
            status: isTeacher ? 'ACTIVE' : enrollment?.status || 'ACTIVE',
            curriculum,
            myReview,
        };
    }
    async getLessonContent(payload) {
        if (!mongoose_1.Types.ObjectId.isValid(payload.courseId) ||
            !mongoose_1.Types.ObjectId.isValid(payload.lessonId)) {
            throw new common_1.BadRequestException('ID không hợp lệ.');
        }
        const lesson = await this.lessonsRepo.findByIdSafe(payload.lessonId, {
            populate: [
                {
                    path: 'primaryVideoId',
                    select: 'publicId url blurHash duration mimetype',
                },
                {
                    path: 'attachments',
                    select: 'publicId url originalName mimetype size',
                },
                {
                    path: 'examId',
                    select: 'mode type',
                }
            ],
        });
        if (!lesson)
            throw new common_1.NotFoundException('Bài học không tồn tại.');
        if (lesson.courseId.toString() !== payload.courseId) {
            throw new common_1.BadRequestException('Bài học không thuộc khóa học này.');
        }
        let hasAccess = lesson.isFreePreview;
        if (!hasAccess) {
            const course = await this.coursesRepo.findByIdSafe(payload.courseId, {
                select: 'teacherId',
            });
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
        if (!hasAccess)
            throw new common_1.ForbiddenException('Vui lòng ghi danh khóa học để xem nội dung này.');
        const courseInfo = await this.coursesRepo.findByIdSafe(payload.courseId, {
            select: 'progressionMode teacherId',
        });
        const mode = courseInfo?.progressionMode || 'FREE';
        if (mode === 'STRICT_LINEAR' &&
            courseInfo?.teacherId?.toString() !== payload.userId) {
            const currentLesson = await this.lessonsRepo.findByIdSafe(payload.lessonId, {
                populate: [{ path: 'sectionId', select: 'order' }],
            });
            const sectionData = currentLesson?.sectionId;
            if (currentLesson && sectionData) {
                const prevLessonId = await this.lessonsRepo.getPreviousLessonId(payload.courseId, sectionData.order, currentLesson.order);
                if (prevLessonId) {
                    const prevProgress = await this.lessonProgressRepo.findOneSafe({
                        userId: new mongoose_1.Types.ObjectId(payload.userId),
                        lessonId: new mongoose_1.Types.ObjectId(prevLessonId),
                    }, { select: 'isCompleted' });
                    if (!prevProgress || !prevProgress.isCompleted) {
                        throw new progression_locked_exception_1.ProgressionLockedException(prevLessonId);
                    }
                }
            }
        }
        const primaryVideo = lesson.primaryVideoId;
        const attachments = (lesson.attachments || []);
        const examData = lesson.examId;
        let progressData = null;
        if (payload.userId) {
            const history = await this.lessonProgressRepo.findOneSafe({
                userId: new mongoose_1.Types.ObjectId(payload.userId),
                lessonId: new mongoose_1.Types.ObjectId(payload.lessonId),
            }, { select: 'watchTime lastPosition isCompleted' });
            if (history) {
                progressData = {
                    watchTime: history.watchTime,
                    lastPosition: history.lastPosition,
                    isCompleted: history.isCompleted,
                };
            }
        }
        return {
            id: lesson._id.toString(),
            title: lesson.title,
            content: lesson.content || null,
            examId: examData ? examData._id.toString() : null,
            examMode: examData ? examData.mode : null,
            examType: examData ? examData.type : null,
            progress: progressData,
            primaryVideo: primaryVideo
                ? {
                    id: primaryVideo._id.toString(),
                    url: this.mediaService.getSecureUrl(primaryVideo.publicId, primaryVideo.mimetype || 'video/mp4'),
                    blurHash: primaryVideo.blurHash,
                    duration: primaryVideo.duration || null,
                }
                : null,
            attachments: attachments.map((att) => ({
                id: att._id.toString(),
                url: this.mediaService.getSecureUrl(att.publicId, att.mimetype),
                originalName: att.originalName,
                mimetype: att.mimetype,
                size: att.size || null,
            })),
        };
    }
    async getMyLearningCourses(payload) {
        const { userId, page, limit } = payload;
        if (!mongoose_1.Types.ObjectId.isValid(userId)) {
            throw new common_1.BadRequestException('ID người dùng không hợp lệ.');
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
                hasPrevPage: page > 1,
            },
        };
    }
};
exports.CourseReaderService = CourseReaderService;
exports.CourseReaderService = CourseReaderService = CourseReaderService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [courses_repository_1.CoursesRepository,
        enrollments_repository_1.EnrollmentsRepository,
        lessons_repository_1.LessonsRepository,
        redis_service_1.RedisService,
        media_service_1.MediaService,
        course_reviews_repository_1.CourseReviewsRepository,
        lesson_progress_repository_1.LessonProgressRepository])
], CourseReaderService);
//# sourceMappingURL=course-reader.service.js.map