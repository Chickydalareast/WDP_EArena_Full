import { PaginationQueryDto } from './pagination.dto';
export declare class AdminListTeacherVerificationQueryDto extends PaginationQueryDto {
    status?: string;
    search?: string;
}
export declare class AdminUpdateTeacherVerificationDto {
    status: string;
    note?: string;
}
