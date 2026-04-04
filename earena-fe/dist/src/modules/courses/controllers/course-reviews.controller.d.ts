import { CourseReviewsService } from '../services/course-reviews.service';
import { CreateCourseReviewDto, ReplyCourseReviewDto } from '../dto/course-review.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
export declare class CourseReviewsController {
    private readonly courseReviewsService;
    constructor(courseReviewsService: CourseReviewsService);
    createReview(courseId: string, dto: CreateCourseReviewDto, userId: string): Promise<{
        message: string;
        stats: {
            averageRating: number;
            totalReviews: number;
        };
    }>;
    replyReview(courseId: string, reviewId: string, dto: ReplyCourseReviewDto, teacherId: string): Promise<{
        message: string;
    }>;
    getReviews(courseId: string, query: PaginationDto): Promise<{
        message: string;
        data: any;
        meta: {
            totalItems: any;
            currentPage: number;
            itemsPerPage: number;
            totalPages: number;
        };
    }>;
}
