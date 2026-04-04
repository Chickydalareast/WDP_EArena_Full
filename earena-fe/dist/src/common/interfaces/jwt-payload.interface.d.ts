import { UserRole } from "../enums/user-role.enum";
export interface IJwtPayload {
    userId: string;
    email: string;
    role: UserRole;
}
