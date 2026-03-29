import { IsOptional, IsString, IsNumber, Min, IsEnum, IsBoolean, IsMongoId } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { CourseSortType } from '../enums/course-search.enum';

export class SearchPublicCoursesDto {
  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsMongoId({ message: 'subjectId phải là định dạng MongoDB ID hợp lệ.' })
  subjectId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'page phải là một số.' })
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'limit phải là một số.' })
  @Min(1)
  limit?: number;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true || value === 1 || value === '1') return true;
    if (value === 'false' || value === false || value === 0 || value === '0') return false;
    return undefined;
  })
  @IsBoolean()
  isFree?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'minPrice phải là số.' })
  @Min(0, { message: 'minPrice không được âm.' })
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'maxPrice phải là số.' })
  @Min(0, { message: 'maxPrice không được âm.' })
  maxPrice?: number;

  @IsOptional()
  @IsEnum(CourseSortType, { message: `sort chỉ chấp nhận các giá trị: ${Object.values(CourseSortType).join(', ')}` })
  sort?: CourseSortType;
}