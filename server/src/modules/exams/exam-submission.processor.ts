import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { Types } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ExamSubmissionsRepository } from './exam-submissions.repository';
import { ExamPapersRepository } from './exam-papers.repository';
import { ExamsRepository } from './exams.repository';
import { EnrollmentsService } from '../courses/services/enrollments.service';
import {
  ExamEventPattern,
  ExamGradedEventPayload,
} from './constants/exam-event.constant';
import { QuestionType } from '../questions/schemas/question.schema';

@Processor('exam-grading')
export class ExamSubmissionProcessor extends WorkerHost {
  private readonly logger = new Logger(ExamSubmissionProcessor.name);

  constructor(
    private readonly submissionsRepo: ExamSubmissionsRepository,
    private readonly papersRepo: ExamPapersRepository,
    private readonly examsRepo: ExamsRepository,
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

      const submission = await this.submissionsRepo.findByIdSafe(submissionId, {
        populate: { path: 'lessonId', select: 'examRules' },
      });

      if (!submission) return;

      if (typeof submission.score === 'number') {
        this.logger.warn(`[Worker] Bài thi ${submissionId} đã có điểm (${submission.score}). Bỏ qua xử lý duplicate.`);
        return;
      }

      const paperModel = await this.papersRepo.findByIdSafe(submission.examPaperId, {
        select: '+answerKeys',
      });
      if (!paperModel) return;

      const examDoc = await this.examsRepo.modelInstance
        .findById(submission.examId)
        .select('totalScore')
        .lean()
        .exec();
      if (!examDoc) return;

      const totalScore = examDoc.totalScore;
      const answerableQuestions = (paperModel.questions || []).filter(q => q.type !== QuestionType.PASSAGE);
      const totalQuestions = answerableQuestions.length || 0;

      const correctAnswersMap = new Map<string, string>();
      (paperModel.answerKeys || []).forEach((key) => {
        correctAnswersMap.set(key.originalQuestionId.toString(), key.correctAnswerId);
      });

      const hasCustomPoints = answerableQuestions.some((q) => q.points !== null && q.points > 0);

      let earnedScore = 0;
      let correctCount = 0;

      const gradedAnswers = (submission.answers || []).map((studentAns) => {
        const qId = studentAns.questionId.toString();
        const correctId = correctAnswersMap.get(qId);
        const isCorrect = studentAns.selectedAnswerId ? studentAns.selectedAnswerId === correctId : false;

        if (isCorrect) {
          correctCount++;
          if (hasCustomPoints) {
            const qDef = answerableQuestions.find((q) => q.originalQuestionId.toString() === qId);
            earnedScore += qDef?.points || 0;
          }
        }
        return { ...studentAns, isCorrect };
      });

      if (!hasCustomPoints && totalQuestions > 0) {
        earnedScore = (correctCount / totalQuestions) * totalScore;
      }

      const finalScore = parseFloat(earnedScore.toFixed(2));

      await this.submissionsRepo.updateByIdSafe(submissionId.toString(), {
        $set: { score: finalScore, answers: gradedAnswers },
      });

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
          } catch (hookError: any) {
            this.logger.error(`[Worker] Điểm đã chấm nhưng lỗi cập nhật tiến độ: ${hookError.message}`);
          }
        }
      }
    } catch (error: any) {
      this.logger.error(`[Worker] Lỗi cục bộ khi xử lý chấm bài: ${error.message}`, error.stack);
      throw error;
    }
  }
}