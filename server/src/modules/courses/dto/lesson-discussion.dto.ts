import { IsString, IsNotEmpty, IsOptional, IsArray, IsMongoId, MaxLength, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDiscussionDto {
    @IsMongoId({ message: 'ID khóa học không hợp lệ' })
    @IsNotEmpty()
    courseId: string;

    @IsMongoId({ message: 'ID bài học không hợp lệ' })
    @IsNotEmpty()
    lessonId: string;

    @IsString()
    @IsNotEmpty({ message: 'Nội dung không được để trống' })
    @MaxLength(3000, { message: 'Nội dung tối đa 3000 ký tự' })
    content: string;

    @IsArray()
    @IsOptional()
    @IsMongoId({ each: true, message: 'ID tệp đính kèm không hợp lệ' })
    attachments?: string[];
}

export class ReplyDiscussionDto extends CreateDiscussionDto {
    @IsMongoId({ message: 'ID câu hỏi gốc không hợp lệ' })
    @IsNotEmpty()
    parentId: string;
}

export enum DiscussionSortBy {
    RECENT = 'recent',
    POPULAR = 'popular',
}

export class DiscussionQueryDto {
    @IsMongoId({ message: 'ID khóa học không hợp lệ' })
    @IsNotEmpty()
    courseId: string;

    @Type(() => Number)
    @Min(1)
    @IsOptional()
    page?: number = 1;

    @Type(() => Number)
    @Min(1)
    @IsOptional()
    limit?: number = 10;

    @IsEnum(DiscussionSortBy)
    @IsOptional()
    sortBy?: DiscussionSortBy = DiscussionSortBy.RECENT;
}

export class ReplyQueryDto {
    @IsMongoId({ message: 'ID khóa học không hợp lệ' })
    @IsNotEmpty()
    courseId: string;
}


export enum CourseDiscussionFilter {
    ALL = 'all',
    UNANSWERED = 'unanswered',
}

export class CourseDiscussionQueryDto {
    @Type(() => Number)
    @Min(1)
    @IsOptional()
    page?: number = 1;

    @Type(() => Number)
    @Min(1)
    @IsOptional()
    limit?: number = 10;

    @IsEnum(DiscussionSortBy)
    @IsOptional()
    sortBy?: DiscussionSortBy = DiscussionSortBy.RECENT;

    @IsEnum(CourseDiscussionFilter)
    @IsOptional()
    filter?: CourseDiscussionFilter = CourseDiscussionFilter.ALL;
}