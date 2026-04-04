import { IsEnum, IsMongoId } from 'class-validator';
import { CommunityFollowTarget } from '../constants/community.constants';

export class CommunityFollowDto {
  @IsEnum(CommunityFollowTarget)
  targetType: CommunityFollowTarget;

  @IsMongoId()
  targetId: string;
}
