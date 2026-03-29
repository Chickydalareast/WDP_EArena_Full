import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { Types } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ExamSubmissionsRepository } from './exam-submissions.repository';
import { ExamPapersRepository } from './exam-papers.repository';
import { EnrollmentsService } from '../courses/services/enrollments.service';
import { ExamEventPattern } from './constants/exam-event.constant';

import type { ExamGradedEventPayload } from './constants/exam-event.constant';

@Processor('exam-grading')
export class ExamSubmissionProcessor extends WorkerHost {
  private readonly logger = new Logger(ExamSubmissionProcessor.name);

  constructor(
    private readonly submissionsRepo: ExamSubmissionsRepository,
    private readonly papersRepo: ExamPapersRepository,
    private readonly enrollmentsService: EnrollmentsService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    super();
  }

  async process(job: Job<{ submissionId: string }>): Promise<any> {
    if (job.name === 'grade-submission') {
      return this.handleGrading(job);
    }
    this.logger.warn(`Unknown job name: ${job.name}`);
  }

  private async handleGrading(job: Job<{ submissionId: string }>) {
    this.logger.log(`[Worker] Đang tiếp nhận chấm điểm bài thi: ${job.data.submissionId}`);

    try {
      const submissionId = new Types.ObjectId(job.data.submissionId);
      const subModel = (this.submissionsRepo as any).model;
      const paperModelDb = (this.papersRepo as any).model;

      const submission = await subModel
        .findById(submissionId)
        .populate('lessonId', 'examRules')
        .lean()
        .exec();

      if (!submission) {
        this.logger.error(`[Worker] Bài thi ${submissionId} không tồn tại trong DB.`);
        return;
      }

      if (typeof submission.score === 'number') {
        this.logger.warn(`[Worker] Bài thi ${submissionId} đã có điểm (${submission.score}). Bỏ qua.`);
        return;
      }

      const paperModel = await paperModelDb
        .findById(submission.examPaperId)
        .select('+answerKeys')
        .lean()
        .exec();

      if (!paperModel) {
        this.logger.error(`[Worker] Không tìm thấy mã đề ${submission.examPaperId}`);
        return;
      }

      const totalScore = 100;
      const totalQuestions = paperModel.questions?.length || 0;
      const defaultPointsPerQuestion = totalQuestions > 0 ? (totalScore / totalQuestions) : 0;

      const correctAnswersMap = new Map<string, string>();
      (paperModel.answerKeys || []).forEach((key: any) => {
        correctAnswersMap.set(key.originalQuestionId.toString(), key.correctAnswerId);
      });

      const pointsMap = new Map<string, number>();
      (paperModel.questions || []).forEach((q: any) => {
        pointsMap.set(q.originalQuestionId.toString(), q.points !== null ? q.points : defaultPointsPerQuestion);
      });

      let earnedScore = 0;
      let correctCount = 0;

      (submission.answers || []).forEach((studentAns: any) => {
        const qId = studentAns.questionId.toString();
        const correctId = correctAnswersMap.get(qId);

        if (studentAns.selectedAnswerId && studentAns.selectedAnswerId === correctId) {
          correctCount++;
          earnedScore += pointsMap.get(qId) || 0;
        }
      });

      const finalScore = parseFloat(earnedScore.toFixed(2));

      await this.submissionsRepo.updateByIdSafe(submissionId, { $set: { score: finalScore } });
      this.logger.log(`[Worker] Chấm xong ${submissionId} | Điểm: ${finalScore}/${totalScore} | Tỷ lệ: ${correctCount}/${totalQuestions}`);

      if (submission.courseId && submission.lessonId) {
        const lessonData = submission.lessonId as any;

        this.eventEmitter.emit(ExamEventPattern.EXAM_GRADED, {
          submissionId: submissionId.toString(),
          studentId: submission.studentId.toString(),
          courseId: submission.courseId.toString(),
          lessonId: lessonData._id.toString(),
          score: finalScore,
        } as ExamGradedEventPayload);

        const requiredPercentage = lessonData?.examRules?.passPercentage ?? 50;
        const actualPercentage = totalScore > 0 ? (finalScore / totalScore) * 100 : 0;

        if (actualPercentage >= requiredPercentage) {
          try {
            await this.enrollmentsService.markLessonCompleted({
              userId: submission.studentId.toString(),
              courseId: submission.courseId.toString(),
              lessonId: lessonData._id.toString(),
            });
            this.logger.log(`[Worker] Đã cập nhật pass Lesson cho User [${submission.studentId}]`);
          } catch (hookError: any) {
            this.logger.error(`[Worker] Điểm đã chấm nhưng lỗi cập nhật tiến độ: ${hookError.message}`);
          }
        } else {
          this.logger.log(`[Worker] User [${submission.studentId}] đạt ${actualPercentage}%, chưa đủ pass (${requiredPercentage}%) để qua bài.`);
        }
      }

    } catch (error: any) {
      this.logger.error(`[Worker] Lỗi cục bộ khi xử lý chấm bài: ${error.message}`, error.stack);
    }
  }
}