import { AdminService } from '../admin.service';
import { AdminListTeacherVerificationQueryDto, AdminUpdateTeacherVerificationDto } from '../dto/admin-teachers.dto';
export declare class AdminTeachersController {
    private readonly adminService;
    constructor(adminService: AdminService);
    list(query: AdminListTeacherVerificationQueryDto): Promise<import("../admin.service").PageResult<any>>;
    verify(adminId: string, id: string, dto: AdminUpdateTeacherVerificationDto): Promise<{
        success: boolean;
    }>;
}
