import { IsString, IsOptional, IsNumber, Min, IsArray, ValidateNested, IsMongoId, IsNotEmpty, IsEnum, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ProgressionMode } from '../enums/progression-mode.enum';

export class UpdateCourseDto {
    @IsOptional() @IsString() title?: string;
    @IsOptional() @IsNumber() @Min(0) price?: number;
    @IsOptional() @IsNumber() @Min(0) discountPrice?: number;
    @IsOptional() @IsString() description?: string;
    @IsOptional() @IsArray() @IsString({ each: true }) benefits?: string[];
    @IsOptional() @IsArray() @IsString({ each: true }) requirements?: string[];
    @IsOptional() @IsMongoId() coverImageId?: string;
    @IsOptional() promotionalVideoId?: string | null;

    @IsOptional() @IsEnum(ProgressionMode) progressionMode?: ProgressionMode;
    @IsOptional() @IsBoolean() isStrictExam?: boolean;
}

export class ReorderSectionItemDto {
    @IsMongoId()
    @IsNotEmpty()
    id: string;

    @IsNumber()
    order: number;
}

export class ReorderLessonItemDto {
    @IsMongoId()
    @IsNotEmpty()
    id: string;

    @IsNumber()
    order: number;

    @IsMongoId({ message: 'sectionId của bài học không được để trống và phải đúng định dạng' })
    @IsNotEmpty()
    sectionId: string;
}

export class ReorderCurriculumDto {
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ReorderSectionItemDto)
    sections?: ReorderSectionItemDto[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ReorderLessonItemDto)
    lessons?: ReorderLessonItemDto[];
}