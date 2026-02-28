import { IsEmail, IsNotEmpty, IsString, Length, IsEnum } from 'class-validator';
import { OtpType } from './send-otp.dto'; 

export class VerifyOtpDto {
  @IsEmail({}, { message: 'Định dạng email không hợp lệ.' })
  @IsNotEmpty()
  email: string;

  @IsString()
  @Length(6, 6, { message: 'Mã OTP phải bao gồm đúng 6 chữ số.' })
  @IsNotEmpty()
  otp: string;

  @IsEnum(OtpType, { message: 'Loại yêu cầu OTP không hợp lệ.' })
  @IsNotEmpty()
  type: OtpType; 
}