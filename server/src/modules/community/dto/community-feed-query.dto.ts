import { IsEnum, IsMongoId, IsOptional, IsString, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { CommunityPostType } from '../constants/community.constants';

export enum CommunityFeedSort {
  NEW = 'NEW',
  HOT = 'HOT',
  FOLLOWING = 'FOLLOWING',
  FOR_YOU = 'FOR_YOU',
}

export class CommunityFeedQueryDto {
  @IsOptional()
  @IsEnum(CommunityFeedSort)
  sort?: CommunityFeedSort;

  @IsOptional()
  @IsEnum(CommunityPostType)
  type?: CommunityPostType;

  @IsOptional()
  @IsMongoId()
  subjectId?: string;

  @IsOptional()
  @IsMongoId()
  courseId?: string;

  @IsOptional()
  @IsMongoId()
  examId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  q?: string;

  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @IsString()
  cursor?: string;
}
