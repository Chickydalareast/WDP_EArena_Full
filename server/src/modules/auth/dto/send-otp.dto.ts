import { IsEmail, IsNotEmpty, IsEnum } from 'class-validator';

export enum OtpType {
  REGISTER = 'REGISTER',
  FORGOT_PASSWORD = 'FORGOT_PASSWORD',
}

export class SendOtpDto {
  @IsEmail({}, { message: 'Định dạng email không hợp lệ.' })
  @IsNotEmpty({ message: 'Email không được để trống.' })
  email: string;

  @IsEnum(OtpType, { message: 'Loại yêu cầu OTP không hợp lệ.' })
  @IsNotEmpty()
  type: OtpType;
}