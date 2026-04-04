import { AdminService } from '../admin.service';
import { AdminListClassesQueryDto, AdminSetClassLockDto } from '../dto/admin-classes.dto';
export declare class AdminClassesController {
    private readonly adminService;
    constructor(adminService: AdminService);
    list(query: AdminListClassesQueryDto): Promise<import("../admin.service").PageResult<any>>;
    setLock(id: string, dto: AdminSetClassLockDto): Promise<{
        success: boolean;
    }>;
    delete(id: string): Promise<{
        success: boolean;
    }>;
}
