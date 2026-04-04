import { Logger } from '@nestjs/common';
import { Connection, Model, Types } from 'mongoose';
import { AbstractRepository } from '../../../common/database/abstract.repository';
import { CourseReviewDocument } from '../schemas/course-review.schema';
export declare class CourseReviewsRepository extends AbstractRepository<CourseReviewDocument> {
    private readonly reviewModel;
    protected readonly logger: Logger;
    constructor(reviewModel: Model<CourseReviewDocument>, connection: Connection);
    calculateAverageRating(courseId: string | Types.ObjectId): Promise<{
        averageRating: number;
        totalReviews: number;
    }>;
    getCourseReviewsPaginated(courseId: string, page: number, limit: number): Promise<{
        items: any;
        total: any;
    }>;
    countUnrepliedReviews(courseId: string | Types.ObjectId): Promise<number>;
}
