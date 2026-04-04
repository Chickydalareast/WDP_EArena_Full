import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types, PipelineStage } from 'mongoose';
import { AbstractRepository } from '../../../common/database/abstract.repository';
import { LessonDiscussion, LessonDiscussionDocument } from '../schemas/lesson-discussion.schema';
import { GetDiscussionsParams, DiscussionOverview, GetCourseDiscussionsParams, CourseDiscussionOverview } from '../interfaces/lesson-discussion.interface';

@Injectable()
export class LessonDiscussionsRepository extends AbstractRepository<LessonDiscussionDocument> {
    protected readonly logger = new Logger(LessonDiscussionsRepository.name);

    constructor(
        @InjectModel(LessonDiscussion.name)
        private readonly discussionModel: Model<LessonDiscussionDocument>,
        @InjectConnection() connection: Connection,
    ) {
        super(discussionModel, connection);
    }

    async atomicUpdateReplyCount(rootDiscussionId: string | Types.ObjectId, incrementBy: number = 1): Promise<void> {
        await this.discussionModel.updateOne(
            { _id: new Types.ObjectId(rootDiscussionId.toString()) },
            {
                $inc: { replyCount: incrementBy },
                $set: { lastRepliedAt: new Date() }
            },
            { session: this.currentSession }
        ).exec();
    }

    async findRootDiscussionsPaginated(params: GetDiscussionsParams): Promise<{ data: DiscussionOverview[], total: number }> {
        const { lessonId, page, limit, sortBy } = params;
        const skip = (page - 1) * limit;

        const matchStage: PipelineStage.Match = {
            $match: {
                lessonId: new Types.ObjectId(lessonId),
                parentId: null,
            }
        };

        const sortStage: PipelineStage.Sort = {
            $sort: sortBy === 'popular'
                ? { replyCount: -1, createdAt: -1 }
                : { lastRepliedAt: -1, createdAt: -1 }
        };

        const pipeline: PipelineStage[] = [
            matchStage,
            sortStage,
            {
                $facet: {
                    metadata: [{ $count: 'total' }],
                    data: [
                        { $skip: skip },
                        { $limit: limit },
                        {
                            $lookup: {
                                from: 'users',
                                localField: 'userId',
                                foreignField: '_id',
                                as: 'user',
                            }
                        },
                        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
                        {
                            $lookup: {
                                from: 'media',
                                localField: 'attachments',
                                foreignField: '_id',
                                as: 'mediaDocs',
                            }
                        },
                        {
                            $project: {
                                _id: 0,
                                id: { $toString: '$_id' },
                                content: 1,
                                replyCount: 1,
                                lastRepliedAt: 1,
                                createdAt: 1,
                                user: {
                                    id: { $toString: '$user._id' },
                                    fullName: '$user.fullName',
                                    avatar: '$user.avatar',
                                },
                                attachments: {
                                    $map: {
                                        input: '$mediaDocs',
                                        as: 'media',
                                        in: {
                                            id: { $toString: '$$media._id' },
                                            url: '$$media.url',
                                            mimetype: '$$media.mimetype'
                                        }
                                    }
                                }
                            }
                        }
                    ]
                }
            }
        ];

        const result = await this.discussionModel.aggregate(pipeline).exec();
        const total = result[0]?.metadata[0]?.total || 0;
        const data = result[0]?.data || [];

        return { data, total };
    }

    async findRepliesByParentId(parentId: string): Promise<DiscussionOverview[]> {
        const pipeline: PipelineStage[] = [
            {
                $match: { parentId: new Types.ObjectId(parentId) }
            },
            { $sort: { createdAt: 1 } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user',
                }
            },
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'media',
                    localField: 'attachments',
                    foreignField: '_id',
                    as: 'mediaDocs',
                }
            },
            {
                $project: {
                    _id: 0,
                    id: { $toString: '$_id' },
                    content: 1,
                    createdAt: 1,
                    user: {
                        id: { $toString: '$user._id' },
                        fullName: '$user.fullName',
                        avatar: '$user.avatar',
                        role: '$user.role',
                    },
                    attachments: {
                        $map: {
                            input: '$mediaDocs',
                            as: 'media',
                            in: { id: { $toString: '$$media._id' }, url: '$$media.url', mimetype: '$$media.mimetype' }
                        }
                    }
                }
            }
        ];

        return this.discussionModel.aggregate(pipeline).exec();
    }


    async findCourseDiscussionsPaginated(params: GetCourseDiscussionsParams): Promise<{ data: CourseDiscussionOverview[], total: number }> {
        const { courseId, page, limit, sortBy, filter } = params;
        const skip = (page - 1) * limit;

        const matchCondition: any = {
            courseId: new Types.ObjectId(courseId),
            parentId: null,
        };

        if (filter === 'unanswered') {
            matchCondition.replyCount = 0;
        }

        const matchStage: PipelineStage.Match = { $match: matchCondition };

        const sortStage: PipelineStage.Sort = {
            $sort: sortBy === 'popular'
                ? { replyCount: -1, createdAt: -1 }
                : { lastRepliedAt: -1, createdAt: -1 }
        };

        const pipeline: PipelineStage[] = [
            matchStage,
            sortStage,
            {
                $facet: {
                    metadata: [{ $count: 'total' }],
                    data: [
                        { $skip: skip },
                        { $limit: limit },
                        {
                            $lookup: {
                                from: 'users',
                                localField: 'userId',
                                foreignField: '_id',
                                as: 'user',
                            }
                        },
                        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
                        
                        {
                            $lookup: {
                                from: 'media',
                                localField: 'attachments',
                                foreignField: '_id',
                                as: 'mediaDocs',
                            }
                        },
                        
                        {
                            $lookup: {
                                from: 'course_lessons',
                                localField: 'lessonId',
                                foreignField: '_id',
                                pipeline: [
                                    { $project: { title: 1, sectionId: 1 } }
                                ],
                                as: 'lessonData',
                            }
                        },
                        { $unwind: { path: '$lessonData', preserveNullAndEmptyArrays: true } },
                        
                        {
                            $lookup: {
                                from: 'course_sections',
                                localField: 'lessonData.sectionId',
                                foreignField: '_id',
                                pipeline: [
                                    { $project: { title: 1 } }
                                ],
                                as: 'sectionData',
                            }
                        },
                        { $unwind: { path: '$sectionData', preserveNullAndEmptyArrays: true } },

                        {
                            $project: {
                                _id: 0,
                                id: { $toString: '$_id' },
                                content: 1,
                                replyCount: 1,
                                lastRepliedAt: 1,
                                createdAt: 1,
                                user: {
                                    id: { $toString: '$user._id' },
                                    fullName: '$user.fullName',
                                    avatar: '$user.avatar',
                                },
                                lesson: {
                                    id: { $toString: '$lessonData._id' },
                                    title: { $ifNull: ['$lessonData.title', 'Bài học không xác định'] },
                                    section: {
                                        $cond: {
                                            if: { $eq: [{ $type: '$sectionData._id' }, 'missing'] },
                                            then: null,
                                            else: {
                                                id: { $toString: '$sectionData._id' },
                                                title: '$sectionData.title'
                                            }
                                        }
                                    }
                                },
                                attachments: {
                                    $map: {
                                        input: '$mediaDocs',
                                        as: 'media',
                                        in: {
                                            id: { $toString: '$$media._id' },
                                            url: '$$media.url',
                                            mimetype: '$$media.mimetype'
                                        }
                                    }
                                }
                            }
                        }
                    ]
                }
            }
        ];

        const result = await this.discussionModel.aggregate(pipeline).exec();
        const total = result[0]?.metadata[0]?.total || 0;
        const data = result[0]?.data || [];

        return { data, total };
    }
}