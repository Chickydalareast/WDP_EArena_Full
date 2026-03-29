import { IsString, IsNotEmpty, IsOptional, IsInt, Min, IsEnum, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';
import { CourseStatus } from '../../courses/schemas/course.schema';

export class RejectCourseDto {
    @IsString()
    @IsNotEmpty({ message: 'Vui lòng cung cấp lý do từ chối khóa học.' })
    reason: string;
}

export class GetPendingCoursesDto {
    @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number = 1;
    @IsOptional() @Type(() => Number) @IsInt() @Min(1) limit?: number = 10;
}

export class GetAdminCoursesDto {
    @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number = 1;
    @IsOptional() @Type(() => Number) @IsInt() @Min(1) limit?: number = 10;

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsEnum(CourseStatus, { message: 'Trạng thái khóa học không hợp lệ.' })
    status?: CourseStatus;

    @IsOptional()
    @IsMongoId({ message: 'Teacher ID không hợp lệ.' })
    teacherId?: string;
}

export class ForceTakedownCourseDto {
  @IsString()
  @IsNotEmpty({ message: 'Thao tác gỡ khẩn cấp bắt buộc phải có lý do cụ thể.' })
  reason: string;
}