export declare class UserResponseDto {
    id: string;
    email: string;
    fullName: string;
    role: string;
    avatar?: string;
    phone?: string;
    dateOfBirth?: Date;
    subjects: {
        id: string;
        name: string;
    }[];
    subscription: {
        planId: string;
        planCode: string;
        expiresAt: string | null;
        isExpired: boolean;
    } | null;
    teacherVerificationStatus?: string;
}
