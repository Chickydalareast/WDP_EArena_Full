import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, PipelineStage, Types } from 'mongoose';
import { AbstractRepository } from '../../../common/database/abstract.repository';
import {
  Enrollment,
  EnrollmentDocument,
  EnrollmentStatus,
} from '../schemas/enrollment.schema';
import { ICourseMemberOverview, IGetCourseMembersParams } from '../interfaces/teacher-tracking.interface';

@Injectable()
export class EnrollmentsRepository extends AbstractRepository<EnrollmentDocument> {
  protected readonly logger = new Logger(EnrollmentsRepository.name);

  constructor(
    @InjectModel(Enrollment.name)
    private readonly enrollmentModel: Model<EnrollmentDocument>,
    @InjectConnection() connection: Connection,
  ) {
    super(enrollmentModel, connection);
  }

  async findUserEnrollment(
    userId: string | Types.ObjectId,
    courseId: string | Types.ObjectId,
  ): Promise<EnrollmentDocument | null> {
    return this.findOneSafe({
      userId: new Types.ObjectId(userId.toString()),
      courseId: new Types.ObjectId(courseId.toString()),
    });
  }

  async atomicUpdateProgress(
    enrollmentId: Types.ObjectId,
    lessonId: Types.ObjectId,
    totalCourseLessons: number,
  ): Promise<EnrollmentDocument | null> {
    const safeTotal = Math.max(1, totalCourseLessons);

    return this.enrollmentModel
      .findByIdAndUpdate(
        enrollmentId,
        [
          {
            $set: {
              completedLessons: {
                $setUnion: [{ $ifNull: ['$completedLessons', []] }, [lessonId]],
              },
            },
          },
          {
            $set: {
              progress: {
                $min: [
                  100,
                  {
                    $floor: {
                      $multiply: [
                        { $divide: [{ $size: '$completedLessons' }, safeTotal] },
                        100,
                      ],
                    },
                  },
                ],
              },
            },
          },
        ],
        { new: true }
      )
      .exec();
  }

  async findMyCoursesPaginated(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const pipeline: PipelineStage[] = [
      {
        $match: {
          userId: new Types.ObjectId(userId),
          status: EnrollmentStatus.ACTIVE,
        },
      },
      { $sort: { updatedAt: -1 } },
      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limit },
            {
              $lookup: {
                from: 'courses',
                localField: 'courseId',
                foreignField: '_id',
                as: 'course',
              },
            },
            { $unwind: { path: '$course', preserveNullAndEmptyArrays: false } },
            {
              $lookup: {
                from: 'users',
                localField: 'course.teacherId',
                foreignField: '_id',
                as: 'teacher',
              },
            },
            { $unwind: { path: '$teacher', preserveNullAndEmptyArrays: true } },
            {
              $lookup: {
                from: 'media',
                localField: 'course.coverImageId',
                foreignField: '_id',
                as: 'coverImage',
              },
            },
            {
              $unwind: {
                path: '$coverImage',
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $project: {
                _id: 0,
                id: { $toString: '$_id' },
                courseId: { $toString: '$course._id' },
                progress: 1,
                status: 1,
                course: {
                  title: '$course.title',
                  slug: '$course.slug',
                  teacher: {
                    fullName: '$teacher.fullName',
                    avatar: '$teacher.avatar',
                  },
                  coverImage: {
                    url: '$coverImage.url',
                    blurHash: '$coverImage.blurHash',
                  },
                },
              },
            },
          ],
          totalCount: [{ $count: 'count' }],
        },
      },
    ];

    const [result] = await this.enrollmentModel.aggregate(pipeline).exec();

    return {
      items: result.data || [],
      total: result.totalCount[0]?.count || 0,
    };
  }

  async findActiveStudentIdsByCourse(
    courseId: string | Types.ObjectId,
  ): Promise<string[]> {
    const enrollments = await this.enrollmentModel
      .find({
        courseId: new Types.ObjectId(courseId.toString()),
        status: EnrollmentStatus.ACTIVE,
      })
      .select('userId')
      .lean()
      .exec();

    return enrollments.map((e) => e.userId.toString());
  }

  async getCourseAverageProgress(
    courseId: string | Types.ObjectId,
  ): Promise<number> {
    const pipeline: PipelineStage[] = [
      {
        $match: {
          courseId: new Types.ObjectId(courseId.toString()),
          status: EnrollmentStatus.ACTIVE,
        },
      },
      {
        $group: {
          _id: null,
          avgProgress: { $avg: '$progress' },
        },
      },
    ];

    const result = await this.enrollmentModel.aggregate(pipeline).exec();
    return result.length > 0 ? result[0].avgProgress : 0;
  }
  
  async getMembersWithProgress(
    params: IGetCourseMembersParams
  ): Promise<{ data: ICourseMemberOverview[]; total: number }> {
    const { courseId, page, limit, search, sortBy, sortOrder } = params;
    const skip = (page - 1) * limit;


    const matchStage: any = {
      courseId: new Types.ObjectId(courseId),
      status: 'ACTIVE'
    };

    const pipeline: any[] = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
    ];

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { 'user.fullName': { $regex: search, $options: 'i' } },
            { 'user.email': { $regex: search, $options: 'i' } },
          ],
        },
      });
    }

    pipeline.push({
      $project: {
        userId: '$user._id',
        fullName: '$user.fullName',
        email: '$user.email',
        avatar: { $ifNull: ['$user.avatar', null] },
        progress: 1,
        completedLessonsCount: { $size: { $ifNull: ['$completedLessons', []] } },
        enrolledAt: '$createdAt',
      },
    });

    const sortDirection = sortOrder === 'desc' ? -1 : 1;
    pipeline.push({ $sort: { [sortBy as string]: sortDirection, _id: 1 } });

    pipeline.push({
      $facet: {
        metadata: [{ $count: 'total' }],
        data: [{ $skip: skip }, { $limit: limit }],
      },
    });

    const result = await this.modelInstance.aggregate(pipeline).exec();

    const total = result[0]?.metadata[0]?.total || 0;
    const data = result[0]?.data || [];

    return { data, total };
  }
}


