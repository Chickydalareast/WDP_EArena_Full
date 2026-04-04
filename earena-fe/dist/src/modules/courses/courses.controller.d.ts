import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/course.dto';
import { PromoteCourseDto } from './dto/promote-course.dto';
import { CoursePromotionService } from './services/course-promotion.service';
export declare class CoursesController {
    private readonly coursesService;
    private readonly coursePromotionService;
    constructor(coursesService: CoursesService, coursePromotionService: CoursePromotionService);
    createCourse(dto: CreateCourseDto, userId: string): Promise<{
        message: string;
        data: {
            id: string;
            slug: string;
        };
    }>;
    updateCourse(id: string, dto: UpdateCourseDto, userId: string): Promise<import("./schemas/course.schema").CourseDocument | null>;
    deleteCourse(id: string, userId: string): Promise<{
        message: string;
    }>;
    getMyCourses(userId: string): Promise<{
        message: string;
        data: any[];
    }>;
    getTeacherCourseDetail(id: string, userId: string): Promise<{
        message: string;
        data: any;
    }>;
    getTeacherCourseCurriculum(id: string, userId: string): Promise<{
        message: string;
        data: any;
    }>;
    getDashboardStats(id: string, userId: string): Promise<{
        message: string;
        data: any;
    }>;
    submitCourseForReview(id: string, userId: string): Promise<{
        message: string;
    }>;
    promoteCourse(id: string, dto: PromoteCourseDto, userId: string): Promise<{
        message: string;
        data: {
            promotionId: string;
            courseId: string;
            expiresAt: Date;
            amountPaid: number;
        };
    }>;
}
