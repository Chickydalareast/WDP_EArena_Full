import { UserRole } from 'src/common/enums/user-role.enum';
export declare class CreateUserDto {
    email: string;
    fullName: string;
    password: string;
    role?: UserRole;
    subjectIds?: string[];
}
