import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { Types } from 'mongoose';
import { QuestionsRepository } from '../questions/questions.repository';
import { ExamsRepository } from './exams.repository';
import { ExamPapersRepository } from './exam-papers.repository';
import { ExamType } from './schemas/exam.schema';
import { DifficultyLevel, QuestionType } from '../questions/schemas/question.schema';

// [CTO STRICT RULE]: Không dùng DTO ở Tầng Service.
export interface MatrixCriterion {
  folderIds: string[]; 
  topicId: string;     
  difficulty: DifficultyLevel; 
  limit: number;       
}

export interface GenerateExamPayload {
  teacherId: string;
  title: string;
  totalScore: number;
  criteria: MatrixCriterion[];
}

@Injectable()
export class ExamGeneratorService {
  private readonly logger = new Logger(ExamGeneratorService.name);

  constructor(
    private readonly questionsRepo: QuestionsRepository,
    private readonly examsRepo: ExamsRepository,
    private readonly examPapersRepo: ExamPapersRepository,
    // [CTO FIX] Loại bỏ hoàn toàn InjectConnection. Trách nhiệm quản lý Transaction thuộc về Repository.
  ) {}

  // Thuật toán O(N) trộn mảng (Fisher-Yates)
  private shuffleArray<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  async generateFromMatrix(payload: GenerateExamPayload) {
    const { teacherId, title, totalScore, criteria } = payload;
    
    const finalSelectedParents: any[] = [];
    const finalSelectedChildren: any[] = [];

    // ==========================================
    // PHASE 1: FETCH DATA & KNAPSACK TRIMMING
    // ==========================================
    try {
      const fetchPromises = criteria.map(criterion => 
        this.questionsRepo.getRandomQuestions(
          criterion.folderIds, 
          criterion.topicId, 
          criterion.difficulty, 
          criterion.limit
        )
      );
      // Giải quyết Promise song song
      const parentsByCriteria = await Promise.all(fetchPromises);

      for (let i = 0; i < criteria.length; i++) {
        const criterion = criteria[i];
        const drawnParents = parentsByCriteria[i];

        const passageIds = drawnParents
          .filter(q => q.type === QuestionType.PASSAGE)
          .map(q => q._id);

        // Khai báo type tường minh trị dứt điểm lỗi TS7034
        let children: any[] = []; 
        if (passageIds.length > 0) {
          children = await this.questionsRepo.modelInstance.find({
            parentPassageId: { $in: passageIds },
            isArchived: false,
            isDraft: false
          })
          .sort({ orderIndex: 1 }) 
          .lean()
          .exec();
        }

        const childrenMap = new Map<string, any[]>();
        children.forEach(child => {
          const pid = child.parentPassageId.toString();
          if (!childrenMap.has(pid)) childrenMap.set(pid, []);
          childrenMap.get(pid)!.push(child);
        });

        let currentQuestionCount = 0;
        const selectedParentsForCriterion: any[] = [];
        const selectedChildrenForCriterion: any[] = [];

        // Thuật toán trừ lùi Knapsack
        for (const parent of drawnParents) {
          const weight = parent.type === QuestionType.PASSAGE 
            ? (childrenMap.get(parent._id.toString())?.length || 0) 
            : 1;

          if (parent.type === QuestionType.PASSAGE && weight === 0) continue;

          if (currentQuestionCount + weight <= criterion.limit) {
            selectedParentsForCriterion.push(parent);
            if (parent.type === QuestionType.PASSAGE) {
              selectedChildrenForCriterion.push(...childrenMap.get(parent._id.toString())!);
            }
            currentQuestionCount += weight;
          }

          if (currentQuestionCount === criterion.limit) break;
        }

        if (currentQuestionCount < criterion.limit) {
          throw new BadRequestException(
            `Không thể ghép đủ chỉ tiêu ${criterion.limit} câu cho chuyên đề [${criterion.topicId}] mức độ [${criterion.difficulty}]. Chỉ ghép được ${currentQuestionCount} câu do vướng độ dài của các Đoạn văn. Hãy thử lại hoặc nới lỏng Ma trận!`
          );
        }

        finalSelectedParents.push(...selectedParentsForCriterion);
        finalSelectedChildren.push(...selectedChildrenForCriterion);
      }
    } catch (error) {
      this.logger.error('Lỗi khi bốc câu hỏi & tính toán Knapsack', error);
      throw error;
    }

    // ==========================================
    // PHASE 2: BƯỚC 3 - DATA MAPPING CHUẨN HÓA
    // ==========================================
    const paperQuestions: any[] = [];
    const answerKeys: any[] = [];

    const mapQuestionToPaper = (q: any, parentPassageId: Types.ObjectId | null = null) => {
      const isPassageMother = q.type === QuestionType.PASSAGE;

      // Khai báo type tường minh
      let answers: any[] = []; 
      
      // Chỉ xáo trộn đáp án nếu không phải Đoạn văn mẹ
      if (!isPassageMother) {
        const correctAnswer = q.answers?.find((a: any) => a.isCorrect);
        if (!correctAnswer) {
          throw new InternalServerErrorException(`Câu hỏi gốc ID ${q._id} bị lỗi dữ liệu (không có đáp án đúng).`);
        }

        answers = this.shuffleArray(q.answers).map((opt: any) => ({
          id: opt.id,
          content: opt.content
        }));

        answerKeys.push({
          originalQuestionId: q._id,
          correctAnswerId: correctAnswer.id
        });
      }

      // [CTO VÁ LỖ HỔNG #3]: Pass đầy đủ Data sang cấu trúc ExamPaper
      paperQuestions.push({
        originalQuestionId: q._id,
        type: q.type,
        parentPassageId: parentPassageId,
        orderIndex: q.orderIndex || 0,
        explanation: q.explanation || null,
        content: q.content,
        difficultyLevel: q.difficultyLevel,
        answers: answers,
        attachedMedia: q.attachedMedia || [],
        points: null 
      });
    };

    for (const parent of finalSelectedParents) {
      mapQuestionToPaper(parent, null);
      
      if (parent.type === QuestionType.PASSAGE) {
        const childrenOfThisParent = finalSelectedChildren.filter(
          c => c.parentPassageId?.toString() === parent._id.toString()
        );
        childrenOfThisParent.forEach(child => mapQuestionToPaper(child, parent._id));
      }
    }

    // ==========================================
    // PHASE 3: CONTEXTUAL TRANSACTION (ACID)
    // ==========================================
    return this.examsRepo.executeInTransaction(async () => {
      // SỬA Ở ĐÂY: Xóa bỏ duration
      const exam = await this.examsRepo.createDocument({
        title,
        description: 'Đề thi được sinh tự động từ Ma trận',
        teacherId: new Types.ObjectId(teacherId),
        totalScore, 
        type: ExamType.PRACTICE,
        isPublished: false,
      });

      const examPaper = await this.examPapersRepo.createDocument({
        examId: exam._id,
        questions: paperQuestions,
        answerKeys: answerKeys,
      });

      this.logger.log(`[Auto-Gen Engine] Xử lý xong đề ${exam._id} (${paperQuestions.length} items/khối).`);

      return {
        message: 'Sinh đề thi bằng Động cơ Ma trận (Matrix Engine) thành công',
        examId: exam._id,
        examPaperId: examPaper._id,
        totalItems: paperQuestions.length,
        totalActualQuestions: answerKeys.length 
      };
    });
  }
}