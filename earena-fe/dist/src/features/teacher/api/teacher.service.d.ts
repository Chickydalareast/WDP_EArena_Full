import type { Qualification, TeacherVerificationStatus } from '@/features/admin/types/admin.types';
export declare const teacherService: {
    getQualifications: () => Promise<{
        qualifications: Qualification[];
        hasUploadedQualifications: boolean;
        verificationStatus: TeacherVerificationStatus;
    }>;
    uploadQualification: (payload: {
        url: string;
        name: string;
    }) => Promise<{
        qualifications: Qualification[];
        hasUploadedQualifications: boolean;
    }>;
    deleteQualification: (index: number) => Promise<{
        qualifications: Qualification[];
        hasUploadedQualifications: boolean;
    }>;
    submitForVerification: () => Promise<{
        message: string;
    }>;
};
