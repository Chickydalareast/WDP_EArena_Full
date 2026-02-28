import { IsEnum, IsMongoId, IsNotEmpty, NotEquals } from 'class-validator';
import { JoinStatus } from '../schemas/class-member.schema';

export class ReviewMemberDto {
  @IsMongoId()
  @IsNotEmpty()
  studentId: string;

  @IsEnum(JoinStatus)
  @NotEquals(JoinStatus.PENDING, { message: 'Không thể review thành viên về trạng thái PENDING.' })
  status: JoinStatus; 
}