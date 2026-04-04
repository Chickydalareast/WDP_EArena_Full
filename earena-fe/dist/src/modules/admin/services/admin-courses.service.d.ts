import { EventEmitter2 } from '@nestjs/event-emitter';
import { CoursesRepository } from '../../courses/courses.repository';
import { CoursesService } from '../../courses/courses.service';
import { MailService } from '../../mail/mail.service';
import { ApproveCoursePayload, ForceTakedownCoursePayload, GetAdminCoursesPayload, GetPendingCoursesPayload, RejectCoursePayload } from '../interfaces/admin-courses.interface';
export declare class AdminCoursesService {
    private readonly coursesRepo;
    private readonly coursesService;
    private readonly mailService;
    private readonly eventEmitter;
    private readonly logger;
    constructor(coursesRepo: CoursesRepository, coursesService: CoursesService, mailService: MailService, eventEmitter: EventEmitter2);
    getPendingCourses(payload: GetPendingCoursesPayload): Promise<{
        items: {
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
    getCourseDetailForReview(courseId: string): Promise<any>;
    approveCourse(payload: ApproveCoursePayload): Promise<{
        message: string;
    }>;
    rejectCourse(payload: RejectCoursePayload): Promise<{
        message: string;
    }>;
    getAllCourses(payload: GetAdminCoursesPayload): Promise<{
        items: {
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
    forceTakedownCourse(payload: ForceTakedownCoursePayload): Promise<{
        message: string;
    }>;
}
