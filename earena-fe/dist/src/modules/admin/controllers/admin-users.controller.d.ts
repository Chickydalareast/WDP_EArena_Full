import { AdminService } from '../admin.service';
import { AdminCreateUserDto, AdminListUsersQueryDto, AdminResetPasswordDto, AdminUpdateUserRoleDto, AdminUpdateUserStatusDto } from '../dto/admin-users.dto';
export declare class AdminUsersController {
    private readonly adminService;
    constructor(adminService: AdminService);
    list(query: AdminListUsersQueryDto): Promise<import("../admin.service").PageResult<any>>;
    create(dto: AdminCreateUserDto): Promise<{
        _id: import("mongoose").Types.ObjectId;
    }>;
    updateRole(id: string, dto: AdminUpdateUserRoleDto): Promise<{
        success: boolean;
    }>;
    updateStatus(id: string, dto: AdminUpdateUserStatusDto): Promise<{
        success: boolean;
    }>;
    resetPassword(id: string, dto: AdminResetPasswordDto): Promise<{
        newPassword: string;
    }>;
    deactivate(id: string): Promise<{
        success: boolean;
    }>;
}
