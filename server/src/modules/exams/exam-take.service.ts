import { Injectable, Logger, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { Types } from 'mongoose';
import { ExamSubmissionsRepository } from './exam-submissions.repository';
import { ExamPapersRepository } from './exam-papers.repository';
import { SubmissionStatus } from './schemas/exam-submission.schema';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';

@Injectable()
export class ExamTakeService {
  private readonly logger = new Logger(ExamTakeService.name);

  constructor(
    private readonly submissionsRepo: ExamSubmissionsRepository,
    private readonly papersRepo: ExamPapersRepository,
    @InjectQueue('exam-grading') private readonly gradingQueue: Queue,
  ) {}

  async startExam(examId: string, examPaperId: string, studentId: string) {
    const paper = await this.papersRepo.findOne({ _id: new Types.ObjectId(examPaperId) });
    if (!paper) throw new NotFoundException('Mã đề không tồn tại.');

    const existingSubmission = await this.submissionsRepo.findOne({
      examId: new Types.ObjectId(examId),
      studentId: new Types.ObjectId(studentId)
    }).catch(() => null);

    if (existingSubmission) {
      if (existingSubmission.status === SubmissionStatus.COMPLETED) {
        throw new ForbiddenException('Bạn đã hoàn thành bài thi này rồi.');
      }
      return { submissionId: existingSubmission._id, status: existingSubmission.status };
    }

    const questionIds = paper.questions.map(q => q.originalQuestionId);
    const newSubmission = await this.submissionsRepo.initSubmission(
      examId,
      examPaperId,
      studentId,
      questionIds
    );

    return { 
      submissionId: newSubmission._id,
      status: newSubmission.status,
      paper: {
        code: paper.code,
        questions: paper.questions
      }
    };
  }

  async autoSaveAnswer(submissionId: string, questionId: string, selectedAnswerId: string) {
    const isSaved = await this.submissionsRepo.atomicAutoSave(
      submissionId, 
      questionId, 
      selectedAnswerId
    );

    if (!isSaved) {
      throw new BadRequestException('Không thể lưu đáp án. Bài thi đã nộp hoặc không tồn tại.');
    }

    return { success: true };
  }

  async submitExam(submissionId: string) {
    const submission = await this.submissionsRepo.findOne({ _id: new Types.ObjectId(submissionId) });
    
    if (submission.status === SubmissionStatus.COMPLETED) {
      throw new BadRequestException('Bài thi này đã được nộp.');
    }

    await this.submissionsRepo.findOneAndUpdate(
      { _id: new Types.ObjectId(submissionId) } as any,
      { $set: { status: SubmissionStatus.COMPLETED, submittedAt: new Date() } } as any
    );

    await this.gradingQueue.add('grade-submission', {
      submissionId: submissionId.toString()
    });

    return { message: 'Nộp bài thành công. Hệ thống đang chấm điểm.' };
  }
}