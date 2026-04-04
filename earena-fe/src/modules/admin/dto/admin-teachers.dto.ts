import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from './pagination.dto';

export class AdminListTeacherVerificationQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  search?: string;
}

export class AdminUpdateTeacherVerificationDto {
  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  note?: string;
}