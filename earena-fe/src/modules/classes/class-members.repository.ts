import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, PipelineStage, Types } from 'mongoose';
import { AbstractRepository } from '../../common/database/abstract.repository';
import { ClassMember, ClassMemberDocument, JoinStatus } from './schemas/class-member.schema';

@Injectable()
export class ClassMembersRepository extends AbstractRepository<ClassMemberDocument> {
  protected readonly logger = new Logger(ClassMembersRepository.name);

  constructor(
    @InjectModel(ClassMember.name) private readonly memberModel: Model<ClassMemberDocument>,
    @InjectConnection() connection: Connection,
  ) {
    super(memberModel, connection);
  }

  async findExistingMember(classId: string | Types.ObjectId, studentId: string | Types.ObjectId): Promise<any> {
    return this.memberModel.findOne({
      classId: new Types.ObjectId(classId),
      studentId: new Types.ObjectId(studentId),
    }).lean().exec();
  }

  async findMembersWithDetails(classId: string | Types.ObjectId, status?: JoinStatus): Promise<any[]> {
    const query: any = { classId: new Types.ObjectId(classId) };
    if (status) {
      query.status = status;
    }

    return this.memberModel
      .find(query)
      .populate('studentId', 'fullName email avatar')
      .select('studentId status createdAt')
      .sort({ createdAt: 1 }) 
      .lean()
      .exec();
  }

  async findMembersWithDetailsPaginated(
    classId: string | Types.ObjectId,
    queryDto: { status?: JoinStatus; page: number; limit: number }
  ): Promise<any> {
    const { status } = queryDto;
    const page = Number(queryDto.page) || 1;
    const limit = Number(queryDto.limit) || 20;

    const query: any = { classId: new Types.ObjectId(classId) };
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.memberModel
        .find(query)
        .populate('studentId', 'fullName email avatar')
        .select('studentId status createdAt')
        .sort({ createdAt: -1 }) 
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.memberModel.countDocuments(query).exec()
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getJoinedClassesPaginated(studentId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const pipeline: PipelineStage[] = [
      { 
        $match: { 
          studentId: new Types.ObjectId(studentId), 
          status: JoinStatus.APPROVED 
        } 
      },
      {
        $lookup: {
          from: 'classes',
          localField: 'classId',
          foreignField: '_id',
          as: 'classDetail'
        }
      },
      { $unwind: '$classDetail' },
      {
        $lookup: {
          from: 'users',
          localField: 'classDetail.teacherId',
          foreignField: '_id',
          as: 'teacherDetail'
        }
      },
      { $unwind: { path: '$teacherDetail', preserveNullAndEmptyArrays: true } },
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          data: [
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                _id: 0,
                id: { $toString: '$classDetail._id' },
                name: '$classDetail.name',
                coverImageId: { $toString: '$classDetail.coverImageId' },
                isLocked: '$classDetail.isLocked',
                joinedAt: '$createdAt',
                teacher: {
                  id: { $toString: '$teacherDetail._id' },
                  fullName: '$teacherDetail.fullName',
                  avatar: '$teacherDetail.avatar'
                }
              }
            }
          ]
        }
      }
    ];

    const result = await this.memberModel.aggregate(pipeline).exec();
    
    const total = result[0]?.metadata[0]?.total || 0;
    const data = result[0]?.data || [];

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }


  async getStudentWorkspaceData(classId: string, studentId: string): Promise<any> {
    const pipeline: PipelineStage[] = [
      {
        $match: {
          classId: new Types.ObjectId(classId),
          studentId: new Types.ObjectId(studentId),
          status: JoinStatus.APPROVED
        }
      },
      {
        $lookup: {
          from: 'classes',
          localField: 'classId',
          foreignField: '_id',
          as: 'classDetail'
        }
      },
      { $unwind: '$classDetail' },
      {
        $lookup: {
          from: 'users',
          localField: 'classDetail.teacherId',
          foreignField: '_id',
          as: 'teacherDetail'
        }
      },
      { $unwind: { path: '$teacherDetail', preserveNullAndEmptyArrays: true } },
      
      {
        $lookup: {
          from: 'exam_assignments',
          let: { cId: '$classId' },
          pipeline: [
            { $match: { $expr: { $eq: ['$classId', '$$cId'] } } },
            { $sort: { createdAt: -1 } },
            { $limit: 5 },
            {
              $project: {
                _id: 0,
                id: { $toString: '$_id' },
                examId: { $toString: '$examId' },
                startTime: 1,
                endTime: 1,
                timeLimit: 1
              }
            }
          ],
          as: 'recentAssignments'
        }
      },

      {
        $project: {
          _id: 0,
          id: { $toString: '$classDetail._id' },
          name: '$classDetail.name',
          description: '$classDetail.description',
          coverImageId: { $toString: '$classDetail.coverImageId' },
          joinedAt: '$createdAt',
          teacher: {
            id: { $toString: '$teacherDetail._id' },
            fullName: '$teacherDetail.fullName',
            avatar: '$teacherDetail.avatar'
          },
          recentAssignments: 1
        }
      }
    ];

    const result = await this.memberModel.aggregate(pipeline).exec();
    return result[0] || null; 
  }


  async updateMemberStatus(
    classId: string | Types.ObjectId, 
    studentId: string | Types.ObjectId, 
    status: JoinStatus
  ): Promise<any> {
    return this.memberModel.findOneAndUpdate(
      { 
        classId: new Types.ObjectId(classId), 
        studentId: new Types.ObjectId(studentId) 
      },
      { $set: { status } },
      { returnDocument: 'after', lean: true } 
    ).exec();
  }
}