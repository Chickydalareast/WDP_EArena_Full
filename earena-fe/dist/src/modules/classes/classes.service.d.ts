import { OnModuleInit } from '@nestjs/common';
import { Types } from 'mongoose';
import { ClassesRepository } from './classes.repository';
import { ClassMembersRepository } from './class-members.repository';
import { ClassDocument } from './schemas/class.schema';
import { JoinStatus } from './schemas/class-member.schema';
import { RedisService } from '../../common/redis/redis.service';
import { Queue } from 'bullmq';
export type CreateClassPayload = {
    name: string;
    description?: string;
    coverImageUrl?: string;
    isPublic?: boolean;
    teacherId: string;
};
export type UpdateClassPayload = {
    name?: string;
    description?: string;
    coverImageUrl?: string;
    isPublic?: boolean;
    isLocked?: boolean;
};
export type SearchClassQuery = {
    keyword?: string;
    page?: number;
    limit?: number;
};
export declare class ClassesService implements OnModuleInit {
    private readonly classesRepo;
    private readonly classMembersRepo;
    private readonly redisService;
    private readonly classesQueue;
    private readonly logger;
    constructor(classesRepo: ClassesRepository, classMembersRepo: ClassMembersRepository, redisService: RedisService, classesQueue: Queue);
    private generateRandomCode;
    createClass(payload: CreateClassPayload): Promise<ClassDocument>;
    searchPublicClasses(query: SearchClassQuery): Promise<any>;
    requestJoin(classId: string, studentId: string): Promise<{
        message: string;
    }>;
    joinByCode(code: string, studentId: string): Promise<{
        message: string;
    }>;
    reviewMember(classId: string, teacherId: string, targetStudentId: string, status: JoinStatus): Promise<{
        message: string;
    }>;
    getClassPreview(classId: string, userId?: string): Promise<any>;
    getClassMembers(classId: string, teacherId: string, queryDto: {
        status?: JoinStatus;
        page: number;
        limit: number;
    }): Promise<any>;
    getClassesByTeacher(teacherId: string): Promise<import("./classes.repository").ClassResponse[]>;
    getMyClasses(teacherId: string): Promise<any[]>;
    getClassDetailForTeacher(classId: string, teacherId: string): Promise<import("./classes.repository").ClassAdminDetail>;
    updateClass(classId: string, teacherId: string, payload: UpdateClassPayload): Promise<{
        name: string;
        description: string;
        code: string;
        teacherId: Types.ObjectId;
        coverImageUrl: string;
        isLocked: boolean;
        isPublic: boolean;
        $locals: Record<string, unknown>;
        $op: "save" | "validate" | "remove" | null;
        $where: Record<string, unknown>;
        baseModelName?: string;
        collection: import("mongoose").Collection;
        db: import("mongoose").Connection;
        errors?: import("mongoose").Error.ValidationError;
        isNew: boolean;
        schema: import("mongoose").Schema;
        id: string;
    }>;
    deleteClass(classId: string, teacherId: string): Promise<{
        message: string;
    }>;
    kickStudent(classId: string, teacherId: string, studentId: string): Promise<{
        message: string;
    }>;
    getJoinedClasses(userId: string, page: number, limit: number): Promise<{
        data: any;
        meta: {
            page: number;
            limit: number;
            total: any;
            totalPages: number;
        };
    }>;
    getStudentWorkspace(classId: string, studentId: string): Promise<any>;
    leaveClass(classId: string, studentId: string): Promise<{
        message: string;
    }>;
    onModuleInit(): Promise<void>;
    resetClassCode(classId: string, teacherId: string): Promise<{
        message: string;
        newCode: string;
    } | undefined>;
    handleAutoRotateCodes(): Promise<void>;
}
