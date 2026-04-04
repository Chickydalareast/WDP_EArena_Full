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
var CoursesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoursesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("mongoose");
const event_emitter_1 = require("@nestjs/event-emitter");
const courses_repository_1 = require("./courses.repository");
const course_schema_1 = require("./schemas/course.schema");
const sections_repository_1 = require("./repositories/sections.repository");
const lessons_repository_1 = require("./repositories/lessons.repository");
const redis_service_1 = require("../../common/redis/redis.service");
const users_repository_1 = require("../users/users.repository");
const media_repository_1 = require("../media/media.repository");
const media_schema_1 = require("../media/schemas/media.schema");
const course_validator_service_1 = require("./services/course-validator.service");
const course_event_constant_1 = require("./constants/course-event.constant");
const enrollments_repository_1 = require("./repositories/enrollments.repository");
const enrollment_schema_1 = require("./schemas/enrollment.schema");
const course_reviews_repository_1 = require("./repositories/course-reviews.repository");
const wallet_transactions_repository_1 = require("../wallets/wallet-transactions.repository");
let CoursesService = CoursesService_1 = class CoursesService {
    sectionsRepo;
    lessonsRepo;
    coursesRepo;
    redisService;
    usersRepo;
    mediaRepo;
    validatorService;
    eventEmitter;
    enrollmentsRepo;
    courseReviewsRepo;
    walletTransactionsRepo;
    logger = new common_1.Logger(CoursesService_1.name);
    constructor(sectionsRepo, lessonsRepo, coursesRepo, redisService, usersRepo, mediaRepo, validatorService, eventEmitter, enrollmentsRepo, courseReviewsRepo, walletTransactionsRepo) {
        this.sectionsRepo = sectionsRepo;
        this.lessonsRepo = lessonsRepo;
        this.coursesRepo = coursesRepo;
        this.redisService = redisService;
        this.usersRepo = usersRepo;
        this.mediaRepo = mediaRepo;
        this.validatorService = validatorService;
        this.eventEmitter = eventEmitter;
        this.enrollmentsRepo = enrollmentsRepo;
        this.courseReviewsRepo = courseReviewsRepo;
        this.walletTransactionsRepo = walletTransactionsRepo;
    }
    generateSlug(title) {
        return title
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-');
    }
    async clearCourseCache(slug) {
        try {
            const pipeline = this.redisService.getPipeline();
            pipeline.unlink(`course:detail:${slug}`);
            pipeline.unlink(`course:detail:v2:${slug}`);
            await pipeline.exec();
            this.clearPublicListCacheBackground().catch((err) => {
                this.logger.error(`[Background Cache Sweeper] Lỗi chạy ngầm:`, err);
            });
            this.logger.debug(`[Cache Invalidation] Đã trigger dọn dẹp an toàn cho course: ${slug}`);
        }
        catch (error) {
            this.logger.error(`[Cache Error] Lỗi khi xóa cache khóa học ${slug}:`, error);
        }
    }
    async clearPublicListCacheBackground() {
        const TAG_KEY = 'cache_tags:courses:public';
        const publicKeys = await this.redisService.smembers(TAG_KEY);
        if (publicKeys.length === 0)
            return;
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
    async createCourse(payload) {
        const { title, teacherId, price, description, progressionMode, isStrictExam, } = payload;
        if (!mongoose_1.Types.ObjectId.isValid(teacherId)) {
            throw new common_1.BadRequestException('ID giáo viên không hợp lệ.');
        }
        const teacher = await this.usersRepo.findByIdSafe(teacherId, {
            select: 'subjectIds',
        });
        if (!teacher || !teacher.subjectIds || teacher.subjectIds.length === 0) {
            throw new common_1.BadRequestException('Giáo viên chưa được cấu hình bộ môn chuyên trách. Vui lòng cập nhật hồ sơ trước khi tạo khóa học.');
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
                    teacherId: new mongoose_1.Types.ObjectId(teacherId),
                    subjectId: autoMappedSubjectId,
                    progressionMode: progressionMode || 'FREE',
                    isStrictExam: isStrictExam ?? false,
                };
                const createdCourse = await this.coursesRepo.createDocument(courseData);
                return {
                    id: createdCourse._id.toString(),
                    slug: createdCourse.slug,
                };
            }
            catch (error) {
                if (typeof error === 'object' &&
                    error !== null &&
                    'code' in error &&
                    error.code === 11000) {
                    retryCount++;
                    finalSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 8)}`;
                    continue;
                }
                this.logger.error(`Lỗi tạo khóa học: ${error instanceof Error ? error.message : 'Unknown'}`);
                throw new common_1.InternalServerErrorException('Không thể khởi tạo khóa học.');
            }
        }
        throw new common_1.ConflictException('Không thể tạo đường dẫn duy nhất cho khóa học này. Vui lòng đổi tên khác.');
    }
    async verifyMediaOwnershipStrict(mediaIds, teacherId) {
        const validIds = mediaIds.filter((id) => !!id && mongoose_1.Types.ObjectId.isValid(id));
        if (validIds.length === 0)
            return;
        const medias = await this.mediaRepo.modelInstance
            .find({
            _id: { $in: validIds.map((id) => new mongoose_1.Types.ObjectId(id)) },
        })
            .lean()
            .select('uploadedBy status originalName')
            .exec();
        if (medias.length !== validIds.length) {
            throw new common_1.BadRequestException('Một hoặc nhiều tệp đính kèm không tồn tại trong hệ thống.');
        }
        for (const media of medias) {
            if (media.uploadedBy.toString() !== teacherId) {
                this.logger.warn(`[SECURITY ALERT] User ${teacherId} cố gắng gán Media ${media._id} của người khác!`);
                throw new common_1.ForbiddenException(`Tệp tin "${media.originalName}" không thuộc quyền sở hữu của bạn.`);
            }
            if (media.status !== media_schema_1.MediaStatus.READY) {
                throw new common_1.BadRequestException(`Tệp tin "${media.originalName}" đang xử lý hoặc bị lỗi, chưa thể sử dụng.`);
            }
        }
    }
    async updateCourse(payload) {
        const { courseId, teacherId, ...updateData } = payload;
        if (!mongoose_1.Types.ObjectId.isValid(courseId))
            throw new common_1.BadRequestException('ID khóa học không hợp lệ.');
        const course = await this.coursesRepo.findByIdSafe(courseId, {
            select: 'teacherId slug status title progressionMode isStrictExam',
        });
        if (!course)
            throw new common_1.NotFoundException('Khóa học không tồn tại.');
        if (course.teacherId.toString() !== teacherId)
            throw new common_1.ForbiddenException('Bạn không có quyền sửa khóa học này.');
        if (course.status === course_schema_1.CourseStatus.PENDING_REVIEW) {
            throw new common_1.ForbiddenException('Khóa học đang trong quá trình xét duyệt, bạn không thể chỉnh sửa nội dung lúc này.');
        }
        const isChangingProgression = updateData.progressionMode !== undefined &&
            updateData.progressionMode !== course.progressionMode;
        const isChangingStrictExam = updateData.isStrictExam !== undefined &&
            updateData.isStrictExam !== course.isStrictExam;
        if (isChangingProgression || isChangingStrictExam) {
            const studentCount = await this.enrollmentsRepo.modelInstance.countDocuments({
                courseId: new mongoose_1.Types.ObjectId(courseId),
                status: enrollment_schema_1.EnrollmentStatus.ACTIVE,
            });
            if (studentCount > 0) {
                throw new common_1.ForbiddenException('Hành động bị từ chối! Không thể thay đổi Chế độ học tập hoặc Cấu hình thi khi khóa học đã có học viên ghi danh, nhằm tránh gây lỗi tiến độ học của hệ thống.');
            }
        }
        const mediaToVerify = [
            updateData.coverImageId,
            updateData.promotionalVideoId,
        ];
        await this.validatorService.verifyMediaOwnershipStrict(mediaToVerify, teacherId);
        const sanitizedUpdate = Object.keys(updateData).reduce((acc, key) => {
            const k = key;
            if (updateData[k] !== undefined)
                acc[k] = updateData[k];
            return acc;
        }, {});
        if (sanitizedUpdate.coverImageId !== undefined) {
            sanitizedUpdate.coverImageId = sanitizedUpdate.coverImageId
                ? new mongoose_1.Types.ObjectId(sanitizedUpdate.coverImageId)
                : null;
        }
        if (sanitizedUpdate.promotionalVideoId !== undefined) {
            sanitizedUpdate.promotionalVideoId = sanitizedUpdate.promotionalVideoId
                ? new mongoose_1.Types.ObjectId(sanitizedUpdate.promotionalVideoId)
                : null;
        }
        const updated = await this.coursesRepo.updateByIdSafe(courseId, {
            $set: sanitizedUpdate,
        });
        this.clearCourseCache(course.slug);
        return updated;
    }
    async submitCourseForReview(courseId, teacherId) {
        let finalSlug = '';
        let courseTitle = '';
        await this.coursesRepo.executeInTransaction(async () => {
            const course = await this.coursesRepo.findByIdSafe(courseId);
            if (!course)
                throw new common_1.NotFoundException('Khóa học không tồn tại.');
            if (course.teacherId.toString() !== teacherId) {
                throw new common_1.ForbiddenException('Bạn không có quyền gửi duyệt khóa học này.');
            }
            if (course.status === course_schema_1.CourseStatus.PENDING_REVIEW) {
                throw new common_1.BadRequestException('Khóa học này đã được gửi đi và đang chờ Admin duyệt.');
            }
            if (course.status === course_schema_1.CourseStatus.PUBLISHED) {
                throw new common_1.BadRequestException('Khóa học này đã được xuất bản công khai.');
            }
            if (course.price === undefined || course.price < 0) {
                throw new common_1.BadRequestException('Khóa học chưa được thiết lập giá.');
            }
            finalSlug = course.slug;
            courseTitle = course.title;
            await this.validatorService.validateCourseSubmissionRules({
                courseId,
                teacherId,
                price: course.price,
            });
            const hasSection = await this.sectionsRepo.findOneSafe({ courseId: new mongoose_1.Types.ObjectId(courseId) }, { select: '_id' });
            if (!hasSection)
                throw new common_1.BadRequestException('Khóa học phải có ít nhất 1 chương.');
            const hasLesson = await this.lessonsRepo.findOneSafe({ courseId: new mongoose_1.Types.ObjectId(courseId) }, { select: '_id' });
            if (!hasLesson)
                throw new common_1.BadRequestException('Khóa học phải có ít nhất 1 bài học.');
            await this.coursesRepo.updateByIdSafe(courseId, {
                $set: {
                    status: course_schema_1.CourseStatus.PENDING_REVIEW,
                    submittedAt: new Date(),
                    rejectionReason: null,
                },
            });
        });
        if (finalSlug) {
            this.clearCourseCache(finalSlug);
        }
        this.eventEmitter.emit(course_event_constant_1.CourseEventPattern.COURSE_SUBMITTED, {
            courseId,
            teacherId,
            courseTitle,
        });
        return {
            message: 'Đã gửi yêu cầu xuất bản. Vui lòng chờ Admin xét duyệt.',
        };
    }
    async deleteCourse(courseId, teacherId) {
        const course = await this.coursesRepo.findByIdSafe(courseId, {
            select: 'teacherId slug status',
        });
        if (!course)
            throw new common_1.NotFoundException('Khóa học không tồn tại.');
        if (course.teacherId.toString() !== teacherId)
            throw new common_1.ForbiddenException('Bạn không có quyền thao tác trên khóa học này.');
        const studentCount = await this.enrollmentsRepo.modelInstance.countDocuments({
            courseId: new mongoose_1.Types.ObjectId(courseId),
            status: enrollment_schema_1.EnrollmentStatus.ACTIVE,
        });
        if (course.status !== course_schema_1.CourseStatus.DRAFT || studentCount > 0) {
            await this.coursesRepo.updateByIdSafe(courseId, {
                $set: { status: course_schema_1.CourseStatus.ARCHIVED },
            });
            this.eventEmitter.emit(course_event_constant_1.CourseEventPattern.COURSE_STATUS_DEACTIVATED, {
                courseId,
                reason: 'ARCHIVED',
            });
            this.clearCourseCache(course.slug);
            return {
                message: 'Khóa học đã được chuyển sang trạng thái Lưu trữ (Archived) nhằm bảo vệ quyền lợi của học viên đã mua.',
            };
        }
        await this.coursesRepo.executeInTransaction(async () => {
            await this.lessonsRepo.deleteManySafe({
                courseId: new mongoose_1.Types.ObjectId(courseId),
            });
            await this.sectionsRepo.deleteManySafe({
                courseId: new mongoose_1.Types.ObjectId(courseId),
            });
            await this.coursesRepo.deleteOneSafe({
                _id: new mongoose_1.Types.ObjectId(courseId),
            });
        });
        this.clearCourseCache(course.slug);
        return {
            message: 'Đã xóa vĩnh viễn khóa học bản nháp và toàn bộ giáo án.',
        };
    }
    async getMyCourses(teacherId) {
        const courses = await this.coursesRepo.getTeacherCoursesWithMetrics(teacherId);
        return courses;
    }
    async getTeacherCourseDetail(courseId, teacherId) {
        if (!mongoose_1.Types.ObjectId.isValid(courseId))
            throw new common_1.BadRequestException('ID không hợp lệ.');
        const course = await this.coursesRepo.getCourseDetailById(courseId);
        if (!course)
            throw new common_1.NotFoundException('Khóa học không tồn tại.');
        if (course.teacherId.toString() !== teacherId)
            throw new common_1.ForbiddenException('Bạn không có quyền xem khóa học này.');
        const { _id, teacherId: tId, coverImageId, promotionalVideoId, ...rest } = course;
        return {
            id: _id.toString(),
            teacherId: tId.toString(),
            coverImage: coverImageId
                ? {
                    id: coverImageId._id.toString(),
                    url: coverImageId.url,
                    blurHash: coverImageId.blurHash,
                }
                : null,
            promotionalVideo: promotionalVideoId
                ? {
                    id: promotionalVideoId._id.toString(),
                    url: promotionalVideoId.url,
                    blurHash: promotionalVideoId.blurHash,
                }
                : null,
            ...rest,
        };
    }
    async getTeacherCourseCurriculum(courseId, teacherId) {
        if (!mongoose_1.Types.ObjectId.isValid(courseId))
            throw new common_1.BadRequestException('ID khóa học không hợp lệ.');
        const course = await this.coursesRepo.findByIdSafe(courseId, {
            select: 'teacherId',
        });
        if (!course)
            throw new common_1.NotFoundException('Khóa học không tồn tại.');
        if (course.teacherId.toString() !== teacherId) {
            throw new common_1.ForbiddenException('Bạn không có quyền xem cấu trúc khóa học này.');
        }
        const curriculum = await this.coursesRepo.getFullCourseCurriculum(courseId, { maskMediaUrls: false });
        return curriculum;
    }
    async getTeacherCourseStats(courseId, teacherId) {
        if (!mongoose_1.Types.ObjectId.isValid(courseId))
            throw new common_1.BadRequestException('ID khóa học không hợp lệ.');
        const cacheKey = `teacher:dashboard:stats:${courseId}`;
        const cachedStats = await this.redisService.get(cacheKey);
        if (cachedStats) {
            return JSON.parse(cachedStats);
        }
        const course = await this.coursesRepo.findByIdSafe(courseId, {
            select: 'teacherId averageRating totalReviews',
        });
        if (!course)
            throw new common_1.NotFoundException('Khóa học không tồn tại.');
        if (course.teacherId.toString() !== teacherId) {
            throw new common_1.ForbiddenException('Bạn không có quyền truy cập thống kê này.');
        }
        const [studentCount, averageProgress, pendingReviews, totalRevenue] = await Promise.all([
            this.enrollmentsRepo.modelInstance.countDocuments({
                courseId: new mongoose_1.Types.ObjectId(courseId),
                status: enrollment_schema_1.EnrollmentStatus.ACTIVE,
            }),
            this.enrollmentsRepo.getCourseAverageProgress(courseId),
            this.courseReviewsRepo.countUnrepliedReviews(courseId),
            this.walletTransactionsRepo.calculateTotalRevenueByCourse(courseId),
        ]);
        const stats = {
            totalStudents: studentCount,
            averageProgress: Math.round(averageProgress * 10) / 10,
            averageRating: course.averageRating || 0,
            totalReviews: course.totalReviews || 0,
            pendingReviews: pendingReviews,
            totalRevenue: totalRevenue,
        };
        await this.redisService.set(cacheKey, JSON.stringify(stats), 300);
        return stats;
    }
};
exports.CoursesService = CoursesService;
exports.CoursesService = CoursesService = CoursesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [sections_repository_1.SectionsRepository,
        lessons_repository_1.LessonsRepository,
        courses_repository_1.CoursesRepository,
        redis_service_1.RedisService,
        users_repository_1.UsersRepository,
        media_repository_1.MediaRepository,
        course_validator_service_1.CourseValidatorService,
        event_emitter_1.EventEmitter2,
        enrollments_repository_1.EnrollmentsRepository,
        course_reviews_repository_1.CourseReviewsRepository,
        wallet_transactions_repository_1.WalletTransactionsRepository])
], CoursesService);
//# sourceMappingURL=courses.service.js.map