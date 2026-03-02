import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from './pagination.dto';
import { TeacherVerificationStatus } from '../../users/schemas/user.schema';

export class AdminListTeacherVerificationQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(TeacherVerificationStatus)
  status?: TeacherVerificationStatus;

  @IsOptional()
  @IsString()
  search?: string;
}

export class AdminUpdateTeacherVerificationDto {
  @IsEnum(TeacherVerificationStatus)
  status: TeacherVerificationStatus;

  @IsOptional()
  @IsString()
  note?: string;
}
