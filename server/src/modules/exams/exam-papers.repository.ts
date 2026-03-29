import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types, UpdateQuery } from 'mongoose';
import { AbstractRepository } from '../../common/database/abstract.repository';
import { 
  ExamPaper, 
  ExamPaperDocument, 
  PaperQuestion, 
  PaperAnswerKey 
} from './schemas/exam-paper.schema';

@Injectable()
export class ExamPapersRepository 
  extends AbstractRepository<ExamPaperDocument> 
  implements OnModuleInit // [MAX PING]: Kích hoạt Lifecycle
{
  protected readonly logger = new Logger(ExamPapersRepository.name);

  constructor(
    @InjectModel(ExamPaper.name) model: Model<ExamPaperDocument>,
    @InjectConnection() connection: Connection,
  ) {
    super(model, connection);
  }

  // [MAX PING]: Vũ khí dọn rác Index tự động
  async onModuleInit() {
    try {
      this.logger.log('Đang quét và đồng bộ Indexes cho bảng ExamPapers...');
      await this.model.syncIndexes();
      this.logger.log('Đồng bộ ExamPapers Indexes thành công! Đã dọn sạch Index rác (E11000).');
    } catch (error: any) {
      this.logger.error(`Lỗi khi sync Indexes bảng ExamPapers: ${error.message}`, error.stack);
    }
  }

  // =========================================================================
  // PAPER DETAILS
  // =========================================================================

  async findPaperDetailWithRelations(paperId: string | Types.ObjectId): Promise<ExamPaperDocument | null> {
    return this.model.findById(new Types.ObjectId(paperId.toString()))
      // Populate sâu vào Media của từng câu hỏi bên trong mảng lồng
      .populate({
        path: 'questions.attachedMedia',
        select: 'url mimetype provider originalName _id'
      })
      .lean()
      .exec() as Promise<ExamPaperDocument | null>;
  }

  // =========================================================================
  // ATOMIC ARRAY OPERATIONS (ADD / REMOVE)
  // =========================================================================

  /**
   * Đẩy Atomic các Sub-Documents vào mảng bằng $push + $each
   * Lưu ý: Tận dụng updateByIdSafe để hưởng lợi từ Session/Transaction
   */
  async addQuestionsToPaper(
    paperId: string | Types.ObjectId,
    questionsToAdd: PaperQuestion[],
    answerKeysToAdd: PaperAnswerKey[] // Chú ý: Dựa vào logic Schema của bạn
  ): Promise<ExamPaperDocument | null> {
    const updatePayload: UpdateQuery<ExamPaperDocument> = {
      $push: {
        questions: { $each: questionsToAdd },
        answerKeys: { $each: answerKeysToAdd },
      } as any // Bypass strict schema check do cấu trúc dynamic
    };

    return this.updateByIdSafe(paperId, updatePayload);
  }

  /**
   * Xóa Atomic các Sub-Documents có chứa originalQuestionId trong danh sách
   */
  async removeQuestionsFromPaper(
    paperId: string | Types.ObjectId,
    questionIdsToRemove: Types.ObjectId[]
  ): Promise<ExamPaperDocument | null> {
    const updatePayload: UpdateQuery<ExamPaperDocument> = {
      $pull: {
        questions: { originalQuestionId: { $in: questionIdsToRemove } },
        answerKeys: { originalQuestionId: { $in: questionIdsToRemove } },
      } as any 
    };

    return this.updateByIdSafe(paperId, updatePayload);
  }
}