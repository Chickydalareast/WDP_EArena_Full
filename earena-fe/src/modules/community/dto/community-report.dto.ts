import { IsEnum, IsMongoId, IsOptional, IsString, MaxLength } from 'class-validator';
import { CommunityReportTarget } from '../constants/community.constants';

export class CreateCommunityReportDto {
  @IsEnum(CommunityReportTarget)
  targetType: CommunityReportTarget;

  @IsMongoId()
  targetId: string;

  @IsOptional()
  @IsMongoId()
  postId?: string;

  @IsString()
  @MaxLength(2000)
  reason: string;
}
