import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { Types } from 'mongoose';
import { ExamSubmissionsRepository } from './exam-submissions.repository';
import { ExamPapersRepository } from './exam-papers.repository';
import { QuestionsRepository } from '../questions/questions.repository';
import { SubmissionStatus } from './schemas/exam-submission.schema';

@Processor('exam-grading')
export class ExamSubmissionProcessor {
  private readonly logger = new Logger(ExamSubmissionProcessor.name);

  constructor(
    private readonly submissionsRepo: ExamSubmissionsRepository,
    private readonly papersRepo: ExamPapersRepository,
    private readonly questionsRepo: QuestionsRepository,
  ) {}

  @Process('grade-submission')
  async handleGrading(job: Job<{ submissionId: string }>) {
    this.logger.debug(`Bắt đầu chấm điểm bài thi: ${job.data.submissionId}`);
    
    try {
      const submissionId = new Types.ObjectId(job.data.submissionId);

      // 1. Kéo bài làm của học sinh lên
      const submission = await this.submissionsRepo.findOne({ _id: submissionId });
      if (!submission || submission.status === SubmissionStatus.COMPLETED) {
        return; // Đã chấm rồi hoặc không tồn tại thì bỏ qua
      }

      // 2. Kéo Mã đề để biết học sinh làm những câu hỏi gốc nào
      const paper = await this.papersRepo.findOne({ _id: submission.examPaperId });
      const originalQuestionIds = paper.questions.map(q => q.originalQuestionId);

      // 3. Kéo Câu hỏi gốc từ Ngân hàng để lấy Đáp Án Đúng (isCorrect: true)
      const originalQuestions = await this.questionsRepo.find({ _id: { $in: originalQuestionIds } });

      // Build Map (Từ điển) để dò đáp án O(1) thay vì O(N^2)
      const correctAnswersMap = new Map<string, string>();
      originalQuestions.forEach(q => {
        const correctOpt = q.answers.find(a => a.isCorrect);
        if (correctOpt) {
          correctAnswersMap.set(q._id.toString(), correctOpt.id);
        }
      });

      // 4. Tiến hành chấm điểm
      let correctCount = 0;
      submission.answers.forEach(studentAns => {
        const correctId = correctAnswersMap.get(studentAns.questionId.toString());
        // Nếu học sinh chọn khớp với đáp án đúng
        if (studentAns.selectedAnswerId && studentAns.selectedAnswerId === correctId) {
          correctCount++;
        }
      });

      // Công thức tính điểm hệ 10
      const totalQuestions = paper.questions.length;
      const score = totalQuestions > 0 ? parseFloat(((correctCount / totalQuestions) * 10).toFixed(2)) : 0;

      // 5. Cập nhật kết quả vào DB
      await this.submissionsRepo.findOneAndUpdate(
        { _id: submissionId },
        { 
          $set: { 
            score, 
            status: SubmissionStatus.COMPLETED,
            submittedAt: new Date()
          } 
        }
      );

      this.logger.debug(`Đã chấm xong ${submissionId}. Điểm: ${score} (${correctCount}/${totalQuestions})`);

    } catch (error: any) {
      this.logger.error(`Lỗi Worker khi chấm điểm submission ${job.data.submissionId}: ${error.message}`);
      // Ném lỗi để BullMQ biết job này Failed và tự động Retry
      throw error; 
    }
  }
}