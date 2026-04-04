import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { AbstractRepository } from '../../common/database/abstract.repository';
import { ExamMatrix, ExamMatrixDocument } from './schemas/exam-matrix.schema';

@Injectable()
export class ExamMatricesRepository extends AbstractRepository<ExamMatrixDocument> {
  protected readonly logger = new Logger(ExamMatricesRepository.name);

  constructor(
    @InjectModel(ExamMatrix.name) model: Model<ExamMatrixDocument>,
    @InjectConnection() connection: Connection,
  ) {
    super(model, connection);
  }

  async getPaginatedMatrices(
    teacherId: string,
    filter: { subjectId?: string; search?: string; page: number; limit: number }
  ) {
    const query: Record<string, any> = { teacherId: new Types.ObjectId(teacherId) };

    if (filter.subjectId) {
      query.subjectId = new Types.ObjectId(filter.subjectId);
    }

    if (filter.search) {
      query.$text = { $search: filter.search };
    }

    const [matrices, total] = await Promise.all([
      this.model
        .find(query)
        .sort({ createdAt: -1 })
        .skip((filter.page - 1) * filter.limit)
        .limit(filter.limit)
        .lean()
        .exec(),
      this.model.countDocuments(query).exec(),
    ]);

    return { matrices, total };
  }
}