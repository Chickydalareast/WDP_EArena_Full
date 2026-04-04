import { AdminService } from '../admin.service';
export declare class AdminDashboardController {
    private readonly adminService;
    constructor(adminService: AdminService);
    getOverview(): Promise<{
        users: {
            total: number;
            students: number;
            teachers: number;
            admins: number;
        };
        exams: {
            total: number;
            published: number;
        };
        questions: {
            total: number;
            archived: number;
        };
        classes: {
            total: number;
            locked: number;
        };
        courses: {
            total: number;
            pending: number;
            published: number;
            rejected: number;
        };
    }>;
}
