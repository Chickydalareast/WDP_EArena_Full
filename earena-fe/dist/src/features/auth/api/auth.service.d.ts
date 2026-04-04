import { UserSession } from '../stores/auth.store';
import { LoginDTO } from '../types/auth.schema';
export declare const authKeys: {
    all: readonly ["auth"];
    session: () => readonly ["auth", "session"];
};
export interface SendOtpDTO {
    email: string;
    type: 'REGISTER' | 'FORGOT_PASSWORD';
}
export interface VerifyOtpDTO extends SendOtpDTO {
    otp: string;
}
export interface RegisterQualificationItem {
    url: string;
    name: string;
}
export interface RegisterDTO {
    email: string;
    fullName: string;
    password: string;
    ticket: string;
    role: 'STUDENT' | 'TEACHER';
    subjectIds?: string[];
    qualifications?: RegisterQualificationItem[];
}
export interface ResetPasswordDTO {
    email: string;
    newPassword: string;
    ticket: string;
}
export interface ChangePasswordDTO {
    oldPassword: string;
    newPassword: string;
}
export declare const authService: {
    login: (data: LoginDTO) => Promise<UserSession>;
    logout: () => Promise<void>;
    sendOtp: (data: SendOtpDTO) => Promise<void>;
    verifyOtp: (data: VerifyOtpDTO) => Promise<{
        ticket: string;
    }>;
    register: (data: RegisterDTO) => Promise<UserSession>;
    uploadRegisterQualification: (params: {
        email: string;
        ticket: string;
        name: string;
        file: File;
    }) => Promise<RegisterQualificationItem>;
    resetPassword: (data: ResetPasswordDTO) => Promise<{
        message: string;
    }>;
    changePassword: (data: ChangePasswordDTO) => Promise<{
        message: string;
    }>;
    googleLogin: (data: {
        idToken: string;
    }) => Promise<UserSession>;
    getProfile: () => Promise<UserSession>;
};
