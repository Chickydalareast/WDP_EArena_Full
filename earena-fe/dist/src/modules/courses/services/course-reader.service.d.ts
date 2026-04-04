import { CoursesRepository } from '../courses.repository';
import { EnrollmentsRepository } from '../repositories/enrollments.repository';
import { LessonsRepository } from '../repositories/lessons.repository';
import { RedisService } from '../../../common/redis/redis.service';
import { MediaService } from '../../media/media.service';
import { CourseSortType } from '../enums/course-search.enum';
import { CourseReviewsRepository } from '../repositories/course-reviews.repository';
import { LessonProgressRepository } from '../repositories/lesson-progress.repository';
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
export declare class CourseReaderService {
    private readonly coursesRepo;
    private readonly enrollmentsRepo;
    private readonly lessonsRepo;
    private readonly redisService;
    private readonly mediaService;
    private readonly reviewsRepo;
    private readonly lessonProgressRepo;
    private readonly logger;
    constructor(coursesRepo: CoursesRepository, enrollmentsRepo: EnrollmentsRepository, lessonsRepo: LessonsRepository, redisService: RedisService, mediaService: MediaService, reviewsRepo: CourseReviewsRepository, lessonProgressRepo: LessonProgressRepository);
    searchPublicCourses(payload: SearchPublicCoursesPayload): Promise<any>;
    getPublicCourseDetail(slug: string, userId?: string): Promise<any>;
    getStudyTree(payload: GetStudyTreePayload): Promise<{
        progress: number;
        status: string;
        curriculum: any;
        myReview: {
            id: string;
            rating: number;
            comment: string | null;
            teacherReply: string | null;
            repliedAt: Date | null;
            createdAt: Date | undefined;
        } | null;
    }>;
    getLessonContent(payload: GetLessonContentPayload): Promise<{
        id: string;
        title: string;
        content: string | null;
        examId: any;
        examMode: any;
        examType: any;
        progress: {
            watchTime: number;
            lastPosition: number;
            isCompleted: boolean;
        } | null;
        primaryVideo: {
            id: any;
            url: string;
            blurHash: any;
            duration: any;
        } | null;
        attachments: {
            id: any;
            url: string;
            originalName: any;
            mimetype: any;
            size: any;
        }[];
    }>;
    getMyLearningCourses(payload: GetMyLearningPayload): Promise<{
        data: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
            hasNextPage: boolean;
            hasPrevPage: boolean;
        };
    }>;
}
