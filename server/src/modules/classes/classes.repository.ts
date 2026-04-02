import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types, PipelineStage } from 'mongoose';
import { AbstractRepository } from '../../common/database/abstract.repository';
import { Class, ClassDocument } from './schemas/class.schema';
import { JoinStatus } from './schemas/class-member.schema';

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

@Injectable()
export class ClassesRepository extends AbstractRepository<ClassDocument> {
  protected readonly logger = new Logger(ClassesRepository.name);

  constructor(
    @InjectModel(Class.name) private readonly classModel: Model<ClassDocument>,
    @InjectConnection() connection: Connection,
  ) {
    super(classModel, connection);
  }

  async searchPublicClasses(query: { keyword?: string; page?: number; limit?: number }): Promise<any[]> {
    const { keyword, page = 1, limit = 20 } = query;
    const filter: any = { isPublic: true, isLocked: false };

    if (keyword) {
      filter.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { code: keyword.toUpperCase() },
      ];
    }

    const skip = (page - 1) * limit;

    return this.classModel
      .find(filter)
      .select('name description code teacherId coverImageUrl') // <-- FIX
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();
  }

  async findByCode(code: string): Promise<any> {
    return this.classModel.findOne({ code: code.toUpperCase() }).lean().exec();
  }

  async getClassPreview(classId: string | Types.ObjectId): Promise<any> {
    const data = await this.classModel
      .findById(classId)
      .select('name description code coverImageUrl isPublic isLocked createdAt teacherId') // <-- FIX
      .populate('teacherId', 'fullName avatar email')
      .lean()
      .exec();

    if (!data) return null;

    const { _id, ...rest } = data;
    return { id: _id.toString(), ...rest };
  }

  async findClassesByTeacher(teacherId: string, limit: number = 50): Promise<ClassResponse[]> {
    const classes = await this.classModel
      .find({ teacherId: new Types.ObjectId(teacherId) })
      .select('name description code coverImageUrl isPublic isLocked createdAt') // <-- FIX
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
      .exec();

    return classes.map((cls: any) => {
      const { _id, ...rest } = cls;
      return {
        id: _id.toString(),
        ...rest,
      } as ClassResponse;
    });
  }

  async searchPaginatedPublicClasses(query: { keyword?: string; page?: number; limit?: number }) {
    const { keyword, page = 1, limit = 20 } = query;
    const filter: any = { isPublic: true, isLocked: false };

    if (keyword) {
      filter.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { code: keyword.toUpperCase() },
      ];
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.classModel
        .find(filter)
        .select('name description teacherId coverImageUrl isPublic isLocked createdAt')  // <-- FIX
        .populate('teacherId', 'fullName avatar')
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.classModel.countDocuments(filter).exec()
    ]);

    const mappedData = data.map((item: any) => {
      const { _id, teacherId, ...rest } = item;
      return {
        id: _id.toString(),
        teacher: teacherId ? { id: teacherId._id.toString(), fullName: teacherId.fullName, avatar: teacherId.avatar } : null,
        ...rest
      };
    });

    return {
      data: mappedData,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getTeacherClassesWithMetrics(teacherId: string) {
    const pipeline: PipelineStage[] = [ 
      { $match: { teacherId: new Types.ObjectId(teacherId) } },
      { $sort: { createdAt: -1 as const } },
      {
        $lookup: {
          from: 'class_members',
          let: { classId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$classId', '$$classId'] },
                status: JoinStatus.APPROVED 
              }
            }
          ],
          as: 'approvedMembers'
        }
      },
      {
        $lookup: {
          from: 'class_members',
          let: { classId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$classId', '$$classId'] },
                status: 'PENDING'
              }
            }
          ],
          as: 'pendingMembers'
        }
      },
      {
        $project: {
          id: { $toString: '$_id' },
          _id: 0,
          name: 1,
          code: 1,
          description: 1,
          coverImageUrl: 1,
          isPublic: 1,
          isLocked: 1,
          createdAt: 1,
          studentCount: { $size: '$approvedMembers' },
          pendingCount: { $size: '$pendingMembers' }
        }
      }
    ];

    return this.classModel.aggregate(pipeline).exec();
  }

  async getClassAdminDetails(classId: string | Types.ObjectId): Promise<ClassAdminDetail | null> {
    const pipeline: PipelineStage[] = [
      { $match: { _id: new Types.ObjectId(classId) } },
      {
        $lookup: {
          from: 'class_members',
          let: { cId: '$_id' },
          pipeline: [{ $match: { $expr: { $eq: ['$classId', '$$cId'] }, status: JoinStatus.APPROVED } }],
          as: 'approved'
        }
      },
      {
        $lookup: {
          from: 'class_members',
          let: { cId: '$_id' },
          pipeline: [{ $match: { $expr: { $eq: ['$classId', '$$cId'] }, status: JoinStatus.PENDING } }],
          as: 'pending'
        }
      },
      {
        $project: {
          _id: 0,
          id: { $toString: '$_id' },
          name: 1,
          code: 1,
          description: 1,
          isPublic: 1,
          isLocked: 1,
          coverImageUrl: 1,
          createdAt: 1,
          studentCount: { $size: '$approved' },
          pendingCount: { $size: '$pending' }
        }
      }
    ];

    const result = await this.classModel.aggregate(pipeline).exec();
    return result[0] as ClassAdminDetail || null;
  }

  async rotateAllActiveCodes(generateCodeFn: () => string): Promise<number> {
    const activeClasses = await this.classModel.find({ isLocked: false }).select('_id').lean().exec();
    if (!activeClasses.length) return 0;

    const bulkOps = activeClasses.map((cls) => ({
      updateOne: {
        filter: { _id: cls._id },
        update: { $set: { code: generateCodeFn() } },
      },
    }));

    const result = await this.classModel.bulkWrite(bulkOps, { ordered: false });
    return result.modifiedCount;
  }
}