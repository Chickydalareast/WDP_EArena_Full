export declare enum OtpType {
    REGISTER = "REGISTER",
    FORGOT_PASSWORD = "FORGOT_PASSWORD"
}
export declare class SendOtpDto {
    email: string;
    type: OtpType;
}
