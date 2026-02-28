import { IsOptional, IsString, IsUrl, IsDateString, MaxLength, Matches } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  fullName?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Đường dẫn ảnh đại diện không hợp lệ' })
  avatar?: string;

  @IsOptional()
  @Matches(/(84|0[3|5|7|8|9])+([0-9]{8})\b/, { message: 'Số điện thoại không đúng định dạng VN' })
  phone?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Ngày sinh phải theo định dạng ISO' })
  dateOfBirth?: Date;
}