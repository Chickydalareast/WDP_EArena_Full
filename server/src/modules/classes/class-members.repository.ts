import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
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
}