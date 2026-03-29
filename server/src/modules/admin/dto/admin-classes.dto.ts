import { IsBoolean, IsMongoId, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from './pagination.dto';

export class AdminListClassesQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsMongoId()
  teacherId?: string;
}

export class AdminSetClassLockDto {
  @IsBoolean()
  isLocked: boolean;
}
