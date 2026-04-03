import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { Types } from 'mongoose';
import { ExamPapersRepository } from './exam-papers.repository';
import { ExamsRepository } from './exams.repository';
import { QuestionsRepository } from '../questions/questions.repository';
import {
  QuestionSyncAction,
  QuestionSyncJobData,
} from '../questions/interfaces/question.interface';

@Processor('question-sync')
export class QuestionSyncProcessor extends WorkerHost {
  private readonly logger = new Logger(QuestionSyncProcessor.name);

  constructor(
    private readonly examPapersRepo: ExamPapersRepository,
    private readonly examsRepo: ExamsRepository,
    private readonly questionsRepo: QuestionsRepository,
  ) {
    super();
  }

  async process(job: Job<QuestionSyncJobData>): Promise<void> {
    const { action, questionId } = job.data;
    const questionObjectId = new Types.ObjectId(questionId);

    try {
      const unpublishedExams = await this.examsRepo.modelInstance
        .find({ isPublished: false })
        .select('_id')
        .lean();

      if (unpublishedExams.length === 0) {
        this.logger.debug(
          `[Sync] Bỏ qua ${questionId}. Không có đề nháp nào cần update.`,
        );
        return;
      }

      const unpublishedExamIds = unpublishedExams.map((e) => e._id);
      const paperModel = this.examPapersRepo.modelInstance;

      if (action === QuestionSyncAction.DELETE) {
        const updateResult = await paperModel.updateMany(
          {
            examId: { $in: unpublishedExamIds },
            submissionId: null,
          },
          {
            $pull: {
              questions: { originalQuestionId: questionObjectId },
              answerKeys: { originalQuestionId: questionObjectId },
            },
          },
        );
        this.logger.log(
          `[Sync Worker] Đã dọn sạch câu hỏi ${questionId} khỏi ${updateResult.modifiedCount} Đề nháp.`,
        );
      } else if (action === QuestionSyncAction.UPDATE) {
        const question =
          await this.questionsRepo.findByIdSafe(questionObjectId);
        if (!question) {
          this.logger.warn(
            `[Sync Worker] Hủy đồng bộ vì câu hỏi ${questionId} không còn tồn tại ở bảng gốc.`,
          );
          return;
        }

        const paperAnswers = (question.answers || []).map((a: any) => ({
          id: a.id,
          content: a.content,
        }));
        const correctAns = (question.answers || []).find(
          (a: any) => a.isCorrect,
        );

        const bulkOps: any[] = [];

        bulkOps.push({
          updateMany: {
            filter: {
              examId: { $in: unpublishedExamIds },
              submissionId: null,
              'questions.originalQuestionId': questionObjectId,
            },
            update: {
              $set: {
                'questions.$[qElem].content': question.content,
                'questions.$[qElem].explanation': question.explanation,
                'questions.$[qElem].difficultyLevel': question.difficultyLevel,
                'questions.$[qElem].answers': paperAnswers,
                'questions.$[qElem].attachedMedia':
                  question.attachedMedia || [],
                'questions.$[qElem].type': question.type,
              },
            },
            arrayFilters: [{ 'qElem.originalQuestionId': questionObjectId }],
          },
        });

        if (correctAns) {
          bulkOps.push({
            updateMany: {
              filter: {
                examId: { $in: unpublishedExamIds },
                submissionId: null,
                'answerKeys.originalQuestionId': questionObjectId,
              },
              update: {
                $set: { 'answerKeys.$[kElem].correctAnswerId': correctAns.id },
              },
              arrayFilters: [{ 'kElem.originalQuestionId': questionObjectId }],
            },
          });
        }

        const bulkResult = await paperModel.bulkWrite(bulkOps);
        this.logger.log(
          `[Sync Worker] Đồng bộ thành công câu hỏi ${questionId} vào ${bulkResult.modifiedCount} Đề nháp.`,
        );
      }
    } catch (error: any) {
      this.logger.error(
        `[BullMQ Crash] Không thể đồng bộ câu hỏi ${questionId}. Mã lỗi: ${error.message}`,
      );
      throw error;
    }
  }
}
