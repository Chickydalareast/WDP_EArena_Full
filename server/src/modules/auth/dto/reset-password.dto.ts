import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsEmail({}, { message: 'Định dạng email không hợp lệ.' })
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6, { message: 'Mật khẩu mới phải từ 6 ký tự trở lên.' })
  newPassword: string;

  @IsString()
  @IsNotEmpty({ message: 'Thiếu vé xác thực (Ticket).' })
  ticket: string; // <-- Vé từ bước verify OTP
}