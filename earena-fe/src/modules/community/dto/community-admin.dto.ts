import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { CommunityReportStatus } from '../constants/community.constants';
import { CommunityUserCommunityStatus } from '../constants/community.constants';

export class ResolveCommunityReportDto {
  @IsEnum(CommunityReportStatus)
  status: CommunityReportStatus;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  resolutionNote?: string;
}

export class SetUserCommunityStatusDto {
  @IsEnum(CommunityUserCommunityStatus)
  communityStatus: CommunityUserCommunityStatus;

  @IsOptional()
  @IsDateString()
  mutedUntil?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  moderationNote?: string;
}
