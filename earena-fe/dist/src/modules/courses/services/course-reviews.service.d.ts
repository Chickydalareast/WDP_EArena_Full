import { EventEmitter2 } from '@nestjs/event-emitter';
import { CoursesRepository } from '../courses.repository';
import { EnrollmentsRepository } from '../repositories/enrollments.repository';
import { CourseReviewsRepository } from '../repositories/course-reviews.repository';
import { CreateCourseReviewPayload, GetCourseReviewsPayload, ReplyCourseReviewPayload } from '../interfaces/course.interface';
import { RedisService } from '../../../common/redis/redis.service';
export declare class CourseReviewsService {
    private readonly coursesRepo;
    private readonly enrollmentsRepo;
    private readonly reviewsRepo;
    private readonly redisService;
    private readonly eventEmitter;
    private readonly logger;
    constructor(coursesRepo: CoursesRepository, enrollmentsRepo: EnrollmentsRepository, reviewsRepo: CourseReviewsRepository, redisService: RedisService, eventEmitter: EventEmitter2);
    private clearCourseCache;
    createReview(payload: CreateCourseReviewPayload): Promise<{
        message: string;
        stats: {
            averageRating: number;
            totalReviews: number;
        };
    }>;
    replyReview(payload: ReplyCourseReviewPayload): Promise<{
        message: string;
    }>;
    getReviews(payload: GetCourseReviewsPayload): Promise<{
        items: any;
        meta: {
            totalItems: any;
            currentPage: number;
            itemsPerPage: number;
            totalPages: number;
        };
    }>;
}
