import { IsEnum } from 'class-validator';
import { CommunityReactionKind } from '../constants/community.constants';

export class CommunityReactDto {
  @IsEnum(CommunityReactionKind)
  kind: CommunityReactionKind;
}
