import { PaginationQueryDto } from './pagination.dto';
import { UserStatus } from '../../users/schemas/user.schema';
import { UserRole } from 'src/common/enums/user-role.enum';
export declare class AdminListUsersQueryDto extends PaginationQueryDto {
    search?: string;
    role?: UserRole;
    status?: UserStatus;
}
export declare class AdminCreateUserDto {
    email: string;
    fullName: string;
    password: string;
    role: UserRole;
    status?: UserStatus;
}
export declare class AdminUpdateUserRoleDto {
    role: UserRole;
}
export declare class AdminUpdateUserStatusDto {
    status: UserStatus;
}
export declare class AdminResetPasswordDto {
    newPassword?: string;
}
