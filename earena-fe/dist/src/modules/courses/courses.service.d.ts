import { EventEmitter2 } from '@nestjs/event-emitter';
import { CoursesRepository } from './courses.repository';
import { SectionsRepository } from './repositories/sections.repository';
import { LessonsRepository } from './repositories/lessons.repository';
import { RedisService } from '../../common/redis/redis.service';
import { UsersRepository } from '../users/users.repository';
import { MediaRepository } from '../media/media.repository';
import { CourseValidatorService } from './services/course-validator.service';
import { EnrollmentsRepository } from './repositories/enrollments.repository';
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
export declare class CoursesService {
    private readonly sectionsRepo;
    private readonly lessonsRepo;
    private readonly coursesRepo;
    private readonly redisService;
    private readonly usersRepo;
    private readonly mediaRepo;
    private readonly validatorService;
    private readonly eventEmitter;
    private readonly enrollmentsRepo;
    private readonly courseReviewsRepo;
    private readonly walletTransactionsRepo;
    private readonly logger;
    constructor(sectionsRepo: SectionsRepository, lessonsRepo: LessonsRepository, coursesRepo: CoursesRepository, redisService: RedisService, usersRepo: UsersRepository, mediaRepo: MediaRepository, validatorService: CourseValidatorService, eventEmitter: EventEmitter2, enrollmentsRepo: EnrollmentsRepository, courseReviewsRepo: CourseReviewsRepository, walletTransactionsRepo: WalletTransactionsRepository);
    private generateSlug;
    clearCourseCache(slug: string): Promise<void>;
    private clearPublicListCacheBackground;
    createCourse(payload: CreateCoursePayload): Promise<{
        id: string;
        slug: string;
    }>;
    private verifyMediaOwnershipStrict;
    updateCourse(payload: UpdateCoursePayload): Promise<import("./schemas/course.schema").CourseDocument | null>;
    submitCourseForReview(courseId: string, teacherId: string): Promise<{
        message: string;
    }>;
    deleteCourse(courseId: string, teacherId: string): Promise<{
        message: string;
    }>;
    getMyCourses(teacherId: string): Promise<any[]>;
    getTeacherCourseDetail(courseId: string, teacherId: string): Promise<any>;
    getTeacherCourseCurriculum(courseId: string, teacherId: string): Promise<any>;
    getTeacherCourseStats(courseId: string, teacherId: string): Promise<any>;
}
