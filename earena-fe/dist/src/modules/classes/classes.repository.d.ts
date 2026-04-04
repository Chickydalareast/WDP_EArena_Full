import { Logger } from '@nestjs/common';
import { Connection, Model, Types } from 'mongoose';
import { AbstractRepository } from '../../common/database/abstract.repository';
import { ClassDocument } from './schemas/class.schema';
export interface ClassResponse {
    id: string;
    name: string;
    code: string;
    description: string;
    isPublic: boolean;
    isLocked: boolean;
    createdAt: Date;
}
export interface ClassAdminDetail extends ClassResponse {
    coverImageUrl: string;
    studentCount: number;
    pendingCount: number;
}
export declare class ClassesRepository extends AbstractRepository<ClassDocument> {
    private readonly classModel;
    protected readonly logger: Logger;
    constructor(classModel: Model<ClassDocument>, connection: Connection);
    searchPublicClasses(query: {
        keyword?: string;
        page?: number;
        limit?: number;
    }): Promise<any[]>;
    findByCode(code: string): Promise<any>;
    getClassPreview(classId: string | Types.ObjectId): Promise<any>;
    findClassesByTeacher(teacherId: string, limit?: number): Promise<ClassResponse[]>;
    searchPaginatedPublicClasses(query: {
        keyword?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        data: any[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getTeacherClassesWithMetrics(teacherId: string): Promise<any[]>;
    getClassAdminDetails(classId: string | Types.ObjectId): Promise<ClassAdminDetail | null>;
    rotateAllActiveCodes(generateCodeFn: () => string): Promise<number>;
}
