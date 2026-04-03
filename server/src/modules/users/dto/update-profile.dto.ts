import {
  IsOptional,
  IsString,
  IsDate,
  MaxLength,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  fullName?: string;

  @IsOptional()
  @IsString()
  @Matches(
    /^(https?:\/\/res\.cloudinary\.com\/.*|https?:\/\/.*\.googleusercontent\.com\/.*)$/,
    {
      message:
        'Nguồn ảnh đại diện không được phép. Vui lòng upload qua hệ thống.',
    },
  )
  avatar?: string;

  @IsOptional()
  @Matches(/^(84|0[3|5|7|8|9])[0-9]{8}$/, {
    message: 'Số điện thoại không đúng định dạng VN',
  })
  phone?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Ngày sinh phải là một ngày hợp lệ' })
  dateOfBirth?: Date;

  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Tiểu sử không được vượt quá 1000 ký tự' })
  bio?: string;
}
