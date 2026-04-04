import { AdminCoursesService } from '../services/admin-courses.service';
import { ForceTakedownCourseDto, GetAdminCoursesDto, GetPendingCoursesDto, RejectCourseDto } from '../dto/admin-courses.dto';
export declare class AdminCoursesController {
    private readonly adminCoursesService;
    constructor(adminCoursesService: AdminCoursesService);
    getPendingCourses(query: GetPendingCoursesDto): Promise<{
        message: string;
        data: {
            id: string;
            title: string;
            slug: string;
            price: number;
            teacher: {
                id: any;
                fullName: any;
                email: any;
                avatar: any;
            } | null;
            submittedAt: Date | undefined;
        }[];
        meta: {
            page: number;
            limit: number;
            totalItems: number;
            totalPages: number;
        };
    }>;
    getCourseDetailForReview(id: string): Promise<{
        message: string;
        data: any;
    }>;
    approveCourse(id: string, adminId: string): Promise<{
        message: string;
    }>;
    rejectCourse(id: string, dto: RejectCourseDto, adminId: string): Promise<{
        message: string;
    }>;
    getAllCourses(query: GetAdminCoursesDto): Promise<{
        message: string;
        data: {
            id: any;
            title: any;
            slug: any;
            price: any;
            status: any;
            teacher: {
                id: any;
                fullName: any;
                email: any;
                avatar: any;
            } | null;
            createdAt: any;
            submittedAt: any;
        }[];
        meta: {
            page: number;
            limit: number;
            totalItems: number;
            totalPages: number;
        };
    }>;
    forceTakedownCourse(id: string, dto: ForceTakedownCourseDto, adminId: string): Promise<{
        message: string;
    }>;
}
