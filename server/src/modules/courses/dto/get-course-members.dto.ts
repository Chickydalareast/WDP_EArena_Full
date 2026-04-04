import { IsOptional, IsString, IsEnum } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export enum SortMemberBy {
    PROGRESS = 'progress',
    ENROLLED_AT = 'createdAt',
}

export enum SortOrder {
    ASC = 'asc',
    DESC = 'desc',
}

export class GetCourseMembersQueryDto extends PaginationDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsEnum(SortMemberBy)
    sortBy?: SortMemberBy = SortMemberBy.ENROLLED_AT;

    @IsOptional()
    @IsEnum(SortOrder)
    sortOrder?: SortOrder = SortOrder.DESC;
}