import { Types } from 'mongoose';
import { UsersRepository } from './users.repository';
import { UserDocument, TeacherVerificationStatus } from './schemas/user.schema';
import { UserRole } from 'src/common/enums/user-role.enum';
export type CreateUserPayload = {
    email: string;
    fullName: string;
    password?: string;
    role?: UserRole | string;
    subjectIds?: string[] | Types.ObjectId[];
    isEmailVerified?: boolean;
    qualifications?: {
        url: string;
        name: string;
        uploadedAt: Date;
    }[];
    hasUploadedQualifications?: boolean;
};
export type UpdateProfilePayload = {
    fullName?: string;
    avatar?: string;
    phone?: string;
    dateOfBirth?: Date;
    bio?: string;
};
export type GoogleProfilePayload = {
    email: string;
    fullName: string;
    avatar: string;
    providerId: string;
};
export declare class UsersService {
    private readonly usersRepository;
    private readonly logger;
    constructor(usersRepository: UsersRepository);
    create(payload: CreateUserPayload): Promise<UserDocument>;
    findAll(page?: number, limit?: number): Promise<{
        data: UserDocument[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            hasNextPage: boolean;
            hasPrevPage: boolean;
        };
    }>;
    findByEmailForAuth(email: string): Promise<UserDocument | null>;
    findByEmail(email: string): Promise<UserDocument | null>;
    findById(id: string): Promise<UserDocument | null>;
    findByIdForAuth(id: string): Promise<UserDocument | null>;
    updatePassword(id: string, newRawPassword: string): Promise<void>;
    getProfile(userId: string): Promise<UserDocument>;
    getPublicProfile(userId: string): Promise<UserDocument>;
    updateProfile(userId: string, payload: UpdateProfilePayload): Promise<UserDocument>;
    getBasicUserInfo(userId: string): Promise<import("./schemas/user.schema").User & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    findOrCreateGoogleUser(payload: GoogleProfilePayload): Promise<UserDocument>;
    addQualification(userId: string, qualification: {
        url: string;
        name: string;
        uploadedAt: Date;
    }): Promise<import("./schemas/user.schema").User & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    removeQualification(userId: string, index: number): Promise<(import("./schemas/user.schema").User & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    updateTeacherVerificationStatus(userId: string, status: TeacherVerificationStatus, note?: string): Promise<import("./schemas/user.schema").User & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
}
