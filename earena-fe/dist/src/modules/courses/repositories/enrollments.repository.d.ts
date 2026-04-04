import { Logger } from '@nestjs/common';
import { Connection, Model, Types } from 'mongoose';
import { AbstractRepository } from '../../../common/database/abstract.repository';
import { EnrollmentDocument } from '../schemas/enrollment.schema';
export declare class EnrollmentsRepository extends AbstractRepository<EnrollmentDocument> {
    private readonly enrollmentModel;
    protected readonly logger: Logger;
    constructor(enrollmentModel: Model<EnrollmentDocument>, connection: Connection);
    findUserEnrollment(userId: string | Types.ObjectId, courseId: string | Types.ObjectId): Promise<EnrollmentDocument | null>;
    atomicUpdateProgress(enrollmentId: Types.ObjectId, lessonId: Types.ObjectId, newProgress: number): Promise<EnrollmentDocument | null>;
    findMyCoursesPaginated(userId: string, page: number, limit: number): Promise<{
        items: any;
        total: any;
    }>;
    findActiveStudentIdsByCourse(courseId: string | Types.ObjectId): Promise<string[]>;
    getCourseAverageProgress(courseId: string | Types.ObjectId): Promise<number>;
}
