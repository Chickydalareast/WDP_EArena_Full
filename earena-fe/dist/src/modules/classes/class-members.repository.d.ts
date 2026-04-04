import { Logger } from '@nestjs/common';
import { Connection, Model, Types } from 'mongoose';
import { AbstractRepository } from '../../common/database/abstract.repository';
import { ClassMemberDocument, JoinStatus } from './schemas/class-member.schema';
export declare class ClassMembersRepository extends AbstractRepository<ClassMemberDocument> {
    private readonly memberModel;
    protected readonly logger: Logger;
    constructor(memberModel: Model<ClassMemberDocument>, connection: Connection);
    findExistingMember(classId: string | Types.ObjectId, studentId: string | Types.ObjectId): Promise<any>;
    findMembersWithDetails(classId: string | Types.ObjectId, status?: JoinStatus): Promise<any[]>;
    findMembersWithDetailsPaginated(classId: string | Types.ObjectId, queryDto: {
        status?: JoinStatus;
        page: number;
        limit: number;
    }): Promise<any>;
    getJoinedClassesPaginated(studentId: string, page: number, limit: number): Promise<{
        data: any;
        meta: {
            page: number;
            limit: number;
            total: any;
            totalPages: number;
        };
    }>;
    getStudentWorkspaceData(classId: string, studentId: string): Promise<any>;
    updateMemberStatus(classId: string | Types.ObjectId, studentId: string | Types.ObjectId, status: JoinStatus): Promise<any>;
}
