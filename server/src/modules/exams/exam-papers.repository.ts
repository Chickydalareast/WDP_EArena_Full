import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types, UpdateQuery } from 'mongoose';
import { AbstractRepository } from '../../common/database/abstract.repository';
import {
  ExamPaper,
  ExamPaperDocument,
  PaperQuestion,
  PaperAnswerKey,
} from './schemas/exam-paper.schema';

@Injectable()
export class ExamPapersRepository extends AbstractRepository<ExamPaperDocument> {
  protected readonly logger = new Logger(ExamPapersRepository.name);

  constructor(
    @InjectModel(ExamPaper.name) model: Model<ExamPaperDocument>,
    @InjectConnection() connection: Connection,
  ) {
    super(model, connection);
  }

  async findPaperDetailWithRelations(
    paperId: string | Types.ObjectId,
  ): Promise<ExamPaperDocument | null> {
    return this.model
      .findById(new Types.ObjectId(paperId.toString()))
      .populate({
        path: 'questions.attachedMedia',
        select: 'url mimetype provider originalName _id',
      })
      .lean()
      .exec() as Promise<ExamPaperDocument | null>;
  }

  async addQuestionsToPaper(
    paperId: string | Types.ObjectId,
    questionsToAdd: PaperQuestion[],
    answerKeysToAdd: PaperAnswerKey[],
  ): Promise<ExamPaperDocument | null> {
    const updatePayload: UpdateQuery<ExamPaperDocument> = {
      $push: {
        questions: { $each: questionsToAdd },
        answerKeys: { $each: answerKeysToAdd },
      } as any,
    };
    return this.updateByIdSafe(paperId, updatePayload);
  }

  async removeQuestionsFromPaper(
    paperId: string | Types.ObjectId,
    questionIdsToRemove: Types.ObjectId[],
  ): Promise<ExamPaperDocument | null> {
    const updatePayload: UpdateQuery<ExamPaperDocument> = {
      $pull: {
        questions: { originalQuestionId: { $in: questionIdsToRemove } },
        answerKeys: { originalQuestionId: { $in: questionIdsToRemove } },
      } as any,
    };
    return this.updateByIdSafe(paperId, updatePayload);
  }


  async deletePapersByExamAndSubmission(
    examId: Types.ObjectId,
    submissionId: Types.ObjectId | null,
  ): Promise<void> {
    const activeSession = this.currentSession ?? undefined;
    await this.model
      .deleteMany({ examId, submissionId }, { session: activeSession })
      .exec();
  }

  async createPaper(data: any): Promise<ExamPaperDocument> {
    const activeSession = this.currentSession ?? undefined;
    const doc = new this.model({ ...data, _id: new Types.ObjectId() });
    const saved = await doc.save({ session: activeSession });
    return saved.toObject() as unknown as ExamPaperDocument;
  }
}