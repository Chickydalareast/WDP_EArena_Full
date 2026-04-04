import { OtpType } from './send-otp.dto';
export declare class VerifyOtpDto {
    email: string;
    otp: string;
    type: OtpType;
}
