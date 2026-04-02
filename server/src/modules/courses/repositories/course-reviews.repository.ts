import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, PipelineStage, Types } from 'mongoose';
import { AbstractRepository } from '../../../common/database/abstract.repository';
import { CourseReview, CourseReviewDocument } from '../schemas/course-review.schema';

@Injectable()
export class CourseReviewsRepository extends AbstractRepository<CourseReviewDocument> {
    protected readonly logger = new Logger(CourseReviewsRepository.name);

    constructor(
        @InjectModel(CourseReview.name) private readonly reviewModel: Model<CourseReviewDocument>,
        @InjectConnection() connection: Connection,
    ) {
        super(reviewModel, connection);
    }

    async calculateAverageRating(courseId: string | Types.ObjectId): Promise<{ averageRating: number; totalReviews: number }> {
        const result = await this.reviewModel.aggregate(
            [
                { $match: { courseId: new Types.ObjectId(courseId.toString()) } },
                {
                    $group: {
                        _id: '$courseId',
                        averageRating: { $avg: '$rating' },
                        totalReviews: { $sum: 1 },
                    },
                },
            ],
            { session: this.currentSession }
        );

        if (result.length > 0) {
            return {
                averageRating: Math.round(result[0].averageRating * 10) / 10,
                totalReviews: result[0].totalReviews,
            };
        }
        return { averageRating: 0, totalReviews: 0 };
    }

    async getCourseReviewsPaginated(courseId: string, page: number, limit: number) {
        const skip = (page - 1) * limit;

        const pipeline: PipelineStage[] = [
            { $match: { courseId: new Types.ObjectId(courseId) } },
            { $sort: { createdAt: -1 } },
            {
                $facet: {
                    data: [
                        { $skip: skip },
                        { $limit: limit },
                        {
                            $lookup: {
                                from: 'users',
                                localField: 'userId',
                                foreignField: '_id',
                                as: 'user'
                            }
                        },
                        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
                        {
                            $project: {
                                _id: 0,
                                id: { $toString: '$_id' },
                                rating: 1,
                                comment: 1,
                                teacherReply: 1,
                                repliedAt: 1,
                                createdAt: 1,
                                updatedAt: 1,
                                user: {
                                    id: { $toString: '$user._id' },
                                    fullName: '$user.fullName',
                                    avatar: '$user.avatar'
                                }
                            }
                        }
                    ],
                    totalCount: [{ $count: 'count' }]
                }
            }
        ];

        const [result] = await this.reviewModel.aggregate(pipeline).exec();

        return {
            items: result.data || [],
            total: result.totalCount[0]?.count || 0
        };
    }

    async countUnrepliedReviews(courseId: string | Types.ObjectId): Promise<number> {
        return this.reviewModel.countDocuments({
            courseId: new Types.ObjectId(courseId.toString()),
            $or: [
                { teacherReply: { $exists: false } },
                { teacherReply: null },
                { teacherReply: '' }
            ]
        }).exec();
    }
}