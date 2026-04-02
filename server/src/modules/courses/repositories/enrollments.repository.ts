import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, PipelineStage, Types } from 'mongoose';
import { AbstractRepository } from '../../../common/database/abstract.repository';
import { Enrollment, EnrollmentDocument, EnrollmentStatus } from '../schemas/enrollment.schema';

@Injectable()
export class EnrollmentsRepository extends AbstractRepository<EnrollmentDocument> {
  protected readonly logger = new Logger(EnrollmentsRepository.name);

  constructor(
    @InjectModel(Enrollment.name) private readonly enrollmentModel: Model<EnrollmentDocument>,
    @InjectConnection() connection: Connection,
  ) {
    super(enrollmentModel, connection);
  }

  async findUserEnrollment(userId: string | Types.ObjectId, courseId: string | Types.ObjectId): Promise<EnrollmentDocument | null> {
    return this.findOneSafe({
      userId: new Types.ObjectId(userId.toString()),
      courseId: new Types.ObjectId(courseId.toString()),
    });
  }

  async atomicUpdateProgress(
    enrollmentId: Types.ObjectId,
    lessonId: Types.ObjectId,
    newProgress: number
  ): Promise<EnrollmentDocument | null> {
    return this.enrollmentModel.findByIdAndUpdate(
      enrollmentId,
      {
        $addToSet: { completedLessons: lessonId },
        $set: { progress: newProgress }
      },
      { returnDocument: 'after', lean: true, session: this.currentSession }
    ).exec() as Promise<EnrollmentDocument | null>;
  }

  async findMyCoursesPaginated(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const pipeline: PipelineStage[] = [
      {
        $match: {
          userId: new Types.ObjectId(userId),
          status: EnrollmentStatus.ACTIVE
        }
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
                as: 'course'
              }
            },
            { $unwind: { path: '$course', preserveNullAndEmptyArrays: false } },
            {
              $lookup: {
                from: 'users',
                localField: 'course.teacherId',
                foreignField: '_id',
                as: 'teacher'
              }
            },
            { $unwind: { path: '$teacher', preserveNullAndEmptyArrays: true } },
            {
              $lookup: {
                from: 'media',
                localField: 'course.coverImageId',
                foreignField: '_id',
                as: 'coverImage'
              }
            },
            { $unwind: { path: '$coverImage', preserveNullAndEmptyArrays: true } },
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
                    avatar: '$teacher.avatar'
                  },
                  coverImage: {
                    url: '$coverImage.url',
                    blurHash: '$coverImage.blurHash'
                  }
                }
              }
            }
          ],
          totalCount: [{ $count: 'count' }]
        }
      }
    ];

    const [result] = await this.enrollmentModel.aggregate(pipeline).exec();

    return {
      items: result.data || [],
      total: result.totalCount[0]?.count || 0
    };
  }

  async findActiveStudentIdsByCourse(courseId: string | Types.ObjectId): Promise<string[]> {
    const enrollments = await this.enrollmentModel
      .find({
        courseId: new Types.ObjectId(courseId.toString()),
        status: EnrollmentStatus.ACTIVE
      })
      .select('userId')
      .lean()
      .exec();

    return enrollments.map(e => e.userId.toString());
  }

  async getCourseAverageProgress(courseId: string | Types.ObjectId): Promise<number> {
    const pipeline: PipelineStage[] = [
      { 
        $match: { 
          courseId: new Types.ObjectId(courseId.toString()), 
          status: EnrollmentStatus.ACTIVE 
        } 
      },
      { 
        $group: { 
          _id: null, 
          avgProgress: { $avg: '$progress' } 
        } 
      }
    ];

    const result = await this.enrollmentModel.aggregate(pipeline).exec();
    return result.length > 0 ? result[0].avgProgress : 0;
  }
}