import { CourseReaderService } from '../services/course-reader.service';
import { SearchPublicCoursesDto } from '../dto/course-reader.dto';
import { CoursePublicDetailResponseDto, StudyTreeResponseDto } from '../dto/course-reader-response.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { CoursePromotionService } from '../services/course-promotion.service';
export declare class CourseReaderController {
    private readonly courseReaderService;
    private readonly coursePromotionService;
    constructor(courseReaderService: CourseReaderService, coursePromotionService: CoursePromotionService);
    getFeaturedCarousel(): Promise<{
        message: string;
        data: {
            items: Record<string, unknown>[];
            promoPricePerDay: number;
        };
    }>;
    searchPublicCourses(dto: SearchPublicCoursesDto, userId: string): Promise<any>;
    getPublicCourseDetail(slug: string, userId: string): Promise<{
        message: string;
        data: CoursePublicDetailResponseDto;
    }>;
    getStudyTree(courseId: string, userId: string): Promise<{
        message: string;
        data: StudyTreeResponseDto;
    }>;
    getLessonContent(courseId: string, lessonId: string, userId: string): Promise<{
        message: string;
        data: {
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
        };
    }>;
    getMyLearning(userId: string, query: PaginationDto): Promise<{
        data: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
            hasNextPage: boolean;
            hasPrevPage: boolean;
        };
        message: string;
    }>;
}
