import { PaginationQueryDto } from './pagination.dto';
export declare class AdminListClassesQueryDto extends PaginationQueryDto {
    search?: string;
    teacherId?: string;
}
export declare class AdminSetClassLockDto {
    isLocked: boolean;
}
