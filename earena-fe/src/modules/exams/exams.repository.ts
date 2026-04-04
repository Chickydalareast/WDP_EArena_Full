import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { AbstractRepository } from '../../common/database/abstract.repository';
import { Exam, ExamDocument, ExamType } from './schemas/exam.schema';

@Injectable()
export class ExamsRepository extends AbstractRepository<ExamDocument> {
  protected readonly logger = new Logger(ExamsRepository.name);

  constructor(
    @InjectModel(Exam.name) model: Model<ExamDocument>,
    @InjectConnection() connection: Connection,
  ) {
    super(model, connection);
  }

  async getExamsWithPagination(
    teacherId: string,
    page: number,
    limit: number,
    search?: string,
    type?: ExamType,
    subjectId?: string,
  ) {
    const skip = (page - 1) * limit;
    const matchStage: any = { teacherId: new Types.ObjectId(teacherId) };

    if (search) matchStage.title = { $regex: search, $options: 'i' };

    // [FIX BLIND SPOT]: Xử lý triệt để loại trừ COURSE_QUIZ khỏi danh sách quản lý
    if (type) {
      matchStage.type = type;
    } else {
      matchStage.type = { $ne: ExamType.COURSE_QUIZ }; // Ẩn hoàn toàn quiz nội bộ khóa học
    }

    if (subjectId) matchStage.subjectId = new Types.ObjectId(subjectId);

    const [result] = await this.model.aggregate([
      { $match: matchStage },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: 'exam_papers',
          localField: '_id',
          foreignField: 'examId',
          as: 'papers',
        },
      },
      {
        $addFields: {
          defaultPaperId: {
            $ifNull: [
              { $toString: { $arrayElemAt: ['$papers._id', 0] } },
              null,
            ],
          },
        },
      },
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          data: [
            { $skip: skip },
            { $limit: limit },
            { $project: { __v: 0, updatedAt: 0, papers: 0 } },
          ],
        },
      },
    ]);

    return {
      items: result.data || [],
      total: result.metadata[0]?.total || 0,
    };
  }
}
