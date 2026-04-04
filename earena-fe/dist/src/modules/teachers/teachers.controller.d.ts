import { UsersService } from '../users/users.service';
import { TeacherVerificationStatus } from '../users/schemas/user.schema';
declare class UploadQualificationDto {
    url: string;
    name: string;
}
export declare class TeachersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getQualifications(userId: string): Promise<{
        data: {
            qualifications: {
                url: string;
                name: string;
                uploadedAt: Date;
            }[];
            hasUploadedQualifications: boolean;
            verificationStatus: TeacherVerificationStatus;
        };
    }>;
    uploadQualification(userId: string, dto: UploadQualificationDto): Promise<{
        message: string;
        data: {
            qualifications: {
                url: string;
                name: string;
                uploadedAt: Date;
            }[];
            hasUploadedQualifications: boolean;
        };
    }>;
    deleteQualification(userId: string, indexStr: string): Promise<{
        message: string;
        data: {
            qualifications: {
                url: string;
                name: string;
                uploadedAt: Date;
            }[];
            hasUploadedQualifications: boolean;
        };
    }>;
    submitForVerification(userId: string): Promise<{
        message: string;
    }>;
}
export {};
