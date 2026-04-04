import { CourseStatus } from '../../courses/schemas/course.schema';
export declare class RejectCourseDto {
    reason: string;
}
export declare class GetPendingCoursesDto {
    page?: number;
    limit?: number;
}
export declare class GetAdminCoursesDto {
    page?: number;
    limit?: number;
    search?: string;
    status?: CourseStatus;
    teacherId?: string;
}
export declare class ForceTakedownCourseDto {
    reason: string;
}
