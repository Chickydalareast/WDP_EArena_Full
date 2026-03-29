import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'Vui lòng nhập mật khẩu hiện tại.' })
  oldPassword: string;

  @IsString()
  @MinLength(6, { message: 'Mật khẩu mới phải từ 6 ký tự trở lên.' })
  newPassword: string;
}