import { AdminService } from '../admin.service';
import { AdminBusinessMetricsQueryDto } from '../dto/admin-business.dto';
export declare class AdminBusinessController {
    private readonly adminService;
    constructor(adminService: AdminService);
    metrics(query: AdminBusinessMetricsQueryDto): Promise<{
        users: {
            total: number;
            teachers: number;
            students: number;
        };
        revenue: {
            total: any;
            currency: string;
            paidOrders: any;
        };
        note: string;
    }>;
}
