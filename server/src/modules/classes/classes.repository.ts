import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { AbstractRepository } from '../../common/database/abstract.repository';
import { Class, ClassDocument } from './schemas/class.schema';

export interface ClassResponse {
  id: string;
  name: string;
  code: string;
  description: string;
  isPublic: boolean;
  isLocked: boolean;
  createdAt: Date;
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
      .select('name description code teacherId coverImageId')
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();
  }

  async getClassPreview(classId: string | Types.ObjectId): Promise<any> {
    return this.classModel
      .findById(classId)
      .select('name description code coverImageId isPublic isLocked createdAt teacherId')
      .populate('teacherId', 'fullName avatar email')
      .lean()
      .exec();
  }

  async findByCode(code: string): Promise<any> {
    return this.classModel
      .findOne({ code: code.toUpperCase() })
      .lean()
      .exec();
  }

  async findClassesByTeacher(teacherId: string, limit: number = 50): Promise<ClassResponse[]> {
    const classes = await this.classModel
      .find({ teacherId: new Types.ObjectId(teacherId) })
      .select('name description code coverImageId isPublic isLocked createdAt')
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
  
}