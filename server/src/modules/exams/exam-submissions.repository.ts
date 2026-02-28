import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { AbstractRepository } from '../../common/database/abstract.repository';
import { ExamSubmission, ExamSubmissionDocument, SubmissionStatus } from './schemas/exam-submission.schema';

@Injectable()
export class ExamSubmissionsRepository extends AbstractRepository<ExamSubmissionDocument> {
  protected readonly logger = new Logger(ExamSubmissionsRepository.name);

  constructor(
    @InjectModel(ExamSubmission.name) private readonly submissionModel: Model<ExamSubmissionDocument>,
    @InjectConnection() connection: Connection,
  ) {
    super(submissionModel, connection);
  }

  async initSubmission(
    examId: string, 
    examPaperId: string, 
    studentId: string, 
    questionIds: Types.ObjectId[]
  ): Promise<ExamSubmissionDocument> {
    const initialAnswers = questionIds.map(qId => ({
      questionId: qId,
      selectedAnswerId: null,
    }));

    return this.create({
      examId: new Types.ObjectId(examId),
      examPaperId: new Types.ObjectId(examPaperId),
      studentId: new Types.ObjectId(studentId),
      answers: initialAnswers,
      status: SubmissionStatus.IN_PROGRESS,
      score: null,
      submittedAt: null,
    } as any);
  }

  async atomicAutoSave(
    submissionId: string, 
    questionId: string, 
    selectedAnswerId: string
  ): Promise<boolean> {
    const result = await this.submissionModel.updateOne(
      {
        _id: new Types.ObjectId(submissionId),
        'answers.questionId': new Types.ObjectId(questionId),
        status: SubmissionStatus.IN_PROGRESS,
      },
      {
        $set: { 'answers.$.selectedAnswerId': selectedAnswerId }
      }
    );

    return result.modifiedCount > 0;
  }
}