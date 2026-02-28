import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Định dạng email không hợp lệ.' })
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Họ và tên không được để trống.' })
  fullName: string;

  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải từ 6 ký tự trở lên.' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'Thiếu vé xác thực OTP (Ticket).' })
  ticket: string;
}