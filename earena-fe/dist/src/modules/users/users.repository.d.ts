import { Logger } from '@nestjs/common';
import { Model, Connection, Types } from 'mongoose';
import { AbstractRepository } from '../../common/database/abstract.repository';
import { UserDocument } from './schemas/user.schema';
export interface PopulatedSubscriptionPlan {
    _id: Types.ObjectId;
    code: string;
    name: string;
    isActive: boolean;
    canCreatePaidCourse: boolean;
    isUnlimitedCourses: boolean;
    maxCourses: number;
}
export interface UserSubscriptionData {
    _id: Types.ObjectId;
    role: string;
    status: string;
    planExpiresAt?: Date;
    currentPlanId?: PopulatedSubscriptionPlan | null;
}
export declare class UsersRepository extends AbstractRepository<UserDocument> {
    protected readonly logger: Logger;
    constructor(userModel: Model<UserDocument>, connection: Connection);
    findByEmailWithPassword(email: string): Promise<UserDocument | null>;
    findByIdWithPassword(id: string | Types.ObjectId): Promise<UserDocument | null>;
    findByEmail(email: string): Promise<UserDocument | null>;
    checkEmailExists(email: string): Promise<boolean>;
    findAllPaginated(page: number, limit: number): Promise<{
        data: UserDocument[];
        total: number;
    }>;
    findUserWithSubscription(userId: string | Types.ObjectId): Promise<UserSubscriptionData | null>;
}
