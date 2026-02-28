import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { Types } from 'mongoose';
import { QuestionsRepository } from '../questions/questions.repository';
import { ExamsRepository } from './exams.repository';
import { ExamPapersRepository } from './exam-papers.repository';
import { ExamType } from './schemas/exam.schema';
import { DifficultyLevel } from '../questions/schemas/question.schema';

export type MatrixCriterion = {
  folderIds: string[]; // Lấy từ các Folder nào?
  topicId: string;     // Chuyên đề gì?
  difficulty: DifficultyLevel; // Mức độ nào?
  limit: number;       // Lấy bao nhiêu câu?
};

export type GenerateExamPayload = {
  teacherId: string;
  title: string;
  duration: number;
  totalScore: number;
  criteria: MatrixCriterion[];
};

@Injectable()
export class ExamGeneratorService {
  private readonly logger = new Logger(ExamGeneratorService.name);

  constructor(
    private readonly questionsRepo: QuestionsRepository,
    private readonly examsRepo: ExamsRepository,
    private readonly examPapersRepo: ExamPapersRepository,
  ) {}

  async generateFromMatrix(payload: GenerateExamPayload) {
    const { teacherId, title, duration, totalScore, criteria } = payload;
    let allSelectedQuestions: any[] = [];

    try {
      const fetchPromises = criteria.map(criterion => 
        this.questionsRepo.getRandomQuestions(
          criterion.folderIds, 
          criterion.topicId, 
          criterion.difficulty, 
          criterion.limit
        )
      );

      const results = await Promise.all(fetchPromises);
      
      results.forEach((questions, index) => {
        if (questions.length < criteria[index].limit) {
          throw new BadRequestException(`Không đủ tài nguyên trong Ngân hàng cho chuyên đề ID [${criteria[index].topicId}] mức độ [${criteria[index].difficulty}]. Yêu cầu: ${criteria[index].limit}, Hiện có: ${questions.length}`);
        }
        allSelectedQuestions.push(...questions);
      });
    } catch (error) {
      this.logger.error('Lỗi khi bốc câu hỏi từ Ma trận', error);
      throw error;
    }

    const exam = await this.examsRepo.create({
      title,
      description: 'Đề thi được sinh tự động từ Ma trận',
      teacherId: new Types.ObjectId(teacherId),
      duration,
      totalScore,
      type: ExamType.PRACTICE,
      isPublished: false,
    } as any);

    const paperQuestions = allSelectedQuestions.map((q, index) => {
      const shuffledOptions = [...q.answers].sort(() => Math.random() - 0.5);
      
      return {
        originalQuestionId: q._id,
        content: q.content,
        order: index + 1,
        answers: shuffledOptions.map(opt => ({
          id: opt.id,
          content: opt.content
        }))
      };
    });

    const examPaper = await this.examPapersRepo.create({
      examId: exam._id,
      code: '101',
      questions: paperQuestions
    } as any);

    return {
      message: 'Sinh đề thi thành công',
      examId: exam._id,
      examPaperId: examPaper._id,
      totalQuestions: paperQuestions.length
    };
  }
}