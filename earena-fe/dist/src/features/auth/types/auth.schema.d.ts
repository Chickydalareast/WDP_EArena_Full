import { z } from "zod";
export declare const loginSchema: any;
export type LoginFormDTO = z.infer<typeof loginSchema>;
export type LoginDTO = Omit<LoginFormDTO, "rememberMe">;
export declare const registerEmailSchema: any;
export declare const verifyOtpSchema: any;
export declare const qualificationSchema: any;
export declare const registerDetailsSchema: any;
export type RegisterDetailsDTO = z.infer<typeof registerDetailsSchema>;
export type RegisterEmailDTO = z.infer<typeof registerEmailSchema>;
export type VerifyOtpFormDTO = z.infer<typeof verifyOtpSchema>;
export type QualificationInput = z.infer<typeof qualificationSchema>;
export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        email: string;
        fullName: string;
        role: "STUDENT" | "TEACHER" | "ADMIN";
        balance: number;
        subscription?: string | null;
        avatar?: string;
    };
}
