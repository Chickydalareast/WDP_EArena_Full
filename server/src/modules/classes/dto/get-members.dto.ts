import { IsEnum, IsOptional } from 'class-validator';
import { JoinStatus } from '../schemas/class-member.schema';

export class GetMembersDto {
  @IsEnum(JoinStatus)
  @IsOptional()
  status?: JoinStatus;
}