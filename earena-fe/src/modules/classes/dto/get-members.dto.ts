import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { JoinStatus } from '../schemas/class-member.schema';

export class GetMembersDto {
  @IsEnum(JoinStatus)
  @IsOptional()
  status?: JoinStatus;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;
}