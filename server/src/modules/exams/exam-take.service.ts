import { Injectable, Logger, NotFoundException, BadRequestException, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Types } from 'mongoose';
import { ExamSubmissionsRepository } from './exam-submissions.repository';
import { ExamPapersRepository } from './exam-papers.repository';
import { ExamsRepository } from './exams.repository';
import { QuestionsRepository } from '../questions/questions.repository';
import { LessonsRepository } from '../courses/repositories/lessons.repository';
import { EnrollmentsService } from '../courses/services/enrollments.service';
import { SubmissionStatus } from './schemas/exam-submission.schema';
import { StartExamPayload } from './interfaces/exam-take.interface';
import { ExamMode } from './schemas/exam.schema';
import { QuestionType } from '../questions/schemas/question.schema';
import { ExamEventPattern, ExamSubmittedEventPayload } from './constants/exam-event.constant';
import { ShowResultMode } from '../courses/schemas/lesson.schema'; // [CTO FIX]: Import Enum cấu hình kết quả
import { RedisService } from 'src/common/redis/redis.service';

@Injectable()
export class ExamTakeService {
  private readonly logger = new Logger(ExamTakeService.name);

  constructor(
    private readonly submissionsRepo: ExamSubmissionsRepository,
    private readonly papersRepo: ExamPapersRepository,
    private readonly examsRepo: ExamsRepository,
    private readonly questionsRepo: QuestionsRepository,
    private readonly lessonsRepo: LessonsRepository,
    private readonly enrollmentsService: EnrollmentsService,
    private readonly eventEmitter: EventEmitter2,
    private readonly redisService: RedisService,
  ) { }

  async startExam(payload: StartExamPayload) {
    const { studentId, courseId, lessonId } = payload;
    const studentObjId = new Types.ObjectId(studentId);
    const courseObjId = new Types.ObjectId(courseId);
    const lessonObjId = new Types.ObjectId(lessonId);

    // [MAX PING - BƯỚC 1]: Dựng khiên phân tán bằng Redis chống Double Click (Race Condition)
    const lockKey = `lock:exam-start:${studentId}:${lessonId}`;
    const isLocked = await this.redisService.setNx(lockKey, 'locked', 5); // Khóa trong 5 giây
    if (!isLocked) {
      throw new BadRequestException('Hệ thống đang xử lý tạo đề thi. Vui lòng không click liên tục!');
    }

    try {
      const lesson = await this.lessonsRepo.findByIdSafe(lessonObjId, { populate: 'examId' });
      if (!lesson || lesson.courseId.toString() !== courseId) {
        throw new BadRequestException('Dữ liệu không hợp lệ. Bài học không thuộc khóa học này.');
      }
      if (!lesson.examId) {
        throw new BadRequestException('Bài học này không chứa bài thi/quiz.');
      }

      const exam: any = lesson.examId;
      let rules = lesson.examRules;

      if (!rules) {
        this.logger.warn(`[Data Recovery] Bài học ${lessonObjId} bị khuyết cấu hình ExamRule. Kích hoạt Fallback mặc định.`);
        rules = {
          timeLimit: 45,
          maxAttempts: 1,
          passPercentage: 50,
          showResultMode: ShowResultMode.IMMEDIATELY,
        };
      }

      await this.enrollmentsService.validateCourseExamAccess(studentId, courseId, exam._id.toString());

      const latestSubmission = await this.submissionsRepo.findLatestSubmission(studentId, lessonId);

      if (latestSubmission && latestSubmission.status === SubmissionStatus.IN_PROGRESS) {
        const paper = await this.papersRepo.findByIdSafe(latestSubmission.examPaperId);
        return {
          submissionId: latestSubmission._id,
          status: latestSubmission.status,
          timeLimit: rules.timeLimit,
          startedAt: new Types.ObjectId(latestSubmission._id.toString()).getTimestamp().toISOString(),
          paper: { questions: paper?.questions || [] }
        };
      }

      const nextAttemptNumber = latestSubmission ? latestSubmission.attemptNumber + 1 : 1;
      if (nextAttemptNumber > rules.maxAttempts) {
        throw new ForbiddenException(`Bạn đã hết lượt làm bài (Tối đa ${rules.maxAttempts} lượt).`);
      }

      // ==========================================
      // [THE CORE]: JIT SNAPSHOT ENGINE
      // ==========================================
      let paperQuestions = [];
      let paperAnswerKeys = [];

      if (exam.mode === ExamMode.STATIC || !exam.mode) {
        const masterPaper = await this.papersRepo.findOneSafe(
          { examId: exam._id, submissionId: null },
          { select: '+answerKeys' }
        );
        if (!masterPaper) throw new InternalServerErrorException('Đề thi tĩnh chưa có dữ liệu Master.');
        paperQuestions = masterPaper.questions;
        paperAnswerKeys = masterPaper.answerKeys;
      } else {
        if (!exam.dynamicConfig) {
          throw new InternalServerErrorException('Đề thi động này bị lỗi mất cấu hình ma trận. Vui lòng báo giáo viên tạo lại đề.');
        }
        const dynamicContent = await this.questionsRepo.generateDynamicQuestions(exam.dynamicConfig);
        paperQuestions = dynamicContent.questions;
        paperAnswerKeys = dynamicContent.answerKeys;
      }

      const shuffled = this.shufflePaperForStudent(paperQuestions, paperAnswerKeys);

      const initialAnswers = shuffled.questions.map((q: any) => ({
        questionId: q.originalQuestionId,
        selectedAnswerId: null
      }));

      let actualSubmissionId = '';

      // [MAX PING - BƯỚC 2]: Ép chuẩn Transaction Session & Bắt ID thật do Mongoose sinh ra
      await this.submissionsRepo.executeInTransaction(async () => {
        const session = (this.submissionsRepo as any).currentSession;
        const paperModel = (this.papersRepo as any).model;
        const subModel = (this.submissionsRepo as any).model;

        // 1. Lưu Paper lấy ID thật (Vá lỗi Transaction Leak)
        const createdPapers = await paperModel.create([{
          examId: exam._id,
          questions: shuffled.questions,
          answerKeys: shuffled.answerKeys
        }], { session });

        const realPaperId = createdPapers[0]._id;

        // 2. Lưu Submission liên kết chuẩn xác với Paper (Vá lỗi 404 Đánh tráo ID)
        const createdSubs = await subModel.create([{
          studentId: studentObjId,
          courseId: courseObjId,
          lessonId: lessonObjId,
          examId: exam._id,
          examPaperId: realPaperId,
          attemptNumber: nextAttemptNumber,
          status: SubmissionStatus.IN_PROGRESS,
          answers: initialAnswers
        }], { session });

        const realSubId = createdSubs[0]._id;
        actualSubmissionId = realSubId.toString();

        // 3. Update ngược lại submissionId cho Paper
        await paperModel.updateOne(
          { _id: realPaperId },
          { $set: { submissionId: realSubId } },
          { session }
        );
      });

      this.logger.log(`[JIT Engine] Đã sinh Paper & Submission ${actualSubmissionId}`);

      return {
        submissionId: actualSubmissionId,
        status: SubmissionStatus.IN_PROGRESS,
        timeLimit: rules.timeLimit,
        startedAt: new Types.ObjectId(actualSubmissionId).getTimestamp().toISOString(),
        paper: { questions: shuffled.questions }
      };

    } finally {
      // [MAX PING]: Luôn giải phóng Lock an toàn dù thành công hay thất bại (Crash)
      await this.redisService.del(lockKey);
    }
  }

  async autoSaveAnswer(payload: { submissionId: string; studentId: string; questionId: string; selectedAnswerId: string }) {
    const { submissionId, studentId, questionId, selectedAnswerId } = payload;
    // (Bên Repo cần check thêm studentId nếu muốn bảo mật tuyệt đối)
    await this.submissionsRepo.saveDraftToRedis(submissionId, questionId, selectedAnswerId);
    return { success: true };
  }

  async submitExam(payload: { submissionId: string; studentId: string }) {
    const { submissionId, studentId } = payload;

    // ==========================================
    // [PHASE 3: LỚP PHÒNG NGỰ THỜI GIAN]
    // ==========================================
    const submission = await this.submissionsRepo.findOneSafe(
      { _id: new Types.ObjectId(submissionId), studentId: new Types.ObjectId(studentId) },
      { populate: 'lessonId' }
    );

    if (!submission) throw new NotFoundException('Bài thi không tồn tại.');
    if (submission.status !== SubmissionStatus.IN_PROGRESS) {
      throw new BadRequestException('Bài thi đã được nộp hoặc trạng thái không hợp lệ.');
    }

    const lesson = submission.lessonId as any;
    const timeLimit = lesson?.examRules?.timeLimit || 0;

    if (timeLimit > 0) {
      // Dùng getTimestamp() từ chính _id để lấy thời gian tạo siêu chính xác, chống fake createdAt
      const startTimeMs = new Types.ObjectId(submission._id.toString()).getTimestamp().getTime();
      const nowMs = Date.now();
      const allowedTimeMs = timeLimit * 60 * 1000;
      const networkBufferMs = 60 * 1000; // Cho phép chênh lệch mạng 1 phút

      if (nowMs > startTimeMs + allowedTimeMs + networkBufferMs) {
        this.logger.warn(`[Security] Học viên ${studentId} cố tình nộp bài trễ. Bị block!`);
        throw new BadRequestException('Đã quá thời gian làm bài cho phép. Bài làm không được chấp nhận.');
      }
    }

    // Gộp đáp án từ Redis xuống Mongo
    const success = await this.submissionsRepo.syncRedisToMongoOnSubmit(submissionId, studentId);
    if (!success) throw new InternalServerErrorException('Có lỗi xảy ra khi nộp bài.');

    const eventPayload: ExamSubmittedEventPayload = { submissionId, studentId };
    this.eventEmitter.emit(ExamEventPattern.EXAM_SUBMITTED, eventPayload);

    this.logger.log(`[Assessment Engine] Học viên ${studentId} nộp bài ${submissionId}. Đã phát sự kiện.`);
    return { message: 'Nộp bài thành công, hệ thống đang chấm điểm.' };
  }

  async getSubmissionResult(submissionId: string, studentId: string) {
    if (!Types.ObjectId.isValid(submissionId)) throw new BadRequestException('Mã bài thi không hợp lệ.');

    const submission = await this.submissionsRepo.findOneSafe(
      { _id: new Types.ObjectId(submissionId), studentId: new Types.ObjectId(studentId) },
      { populate: 'lessonId' }
    );

    if (!submission) throw new NotFoundException('Không tìm thấy bài thi.');
    if (submission.status !== SubmissionStatus.COMPLETED) throw new ForbiddenException('Bài thi chưa được nộp.');

    if (submission.score === null) {
      return {
        status: 'GRADING_IN_PROGRESS',
        message: 'Hệ thống đang chấm điểm. Vui lòng không thoát trang.',
        retryAfter: 2000
      };
    }

    const paper = await this.papersRepo.findByIdSafe(submission.examPaperId, { select: '+answerKeys' });
    if (!paper) throw new InternalServerErrorException('Lỗi hệ thống: Mất liên kết Snapshot đề thi.');

    // ==========================================
    // [PHASE 3: LỚP BẢO MẬT ĐÁP ÁN THEO LUẬT CHƠI]
    // ==========================================
    const lesson = submission.lessonId as any;
    const showResultMode = lesson?.examRules?.showResultMode || ShowResultMode.IMMEDIATELY;
    const timeLimit = lesson?.examRules?.timeLimit || 0;

    let canShowDetails = true;
    if (showResultMode === ShowResultMode.NEVER) {
      canShowDetails = false;
    } else if (showResultMode === ShowResultMode.AFTER_END_TIME) {
      if (timeLimit > 0) {
        const startTimeMs = new Types.ObjectId(submission._id.toString()).getTimestamp().getTime();
        const endTimeMs = startTimeMs + (timeLimit * 60 * 1000);
        if (Date.now() < endTimeMs) {
          canShowDetails = false; // Vẫn trong thời gian làm bài của lượt thi này -> Giấu nhẹm
        }
      }
    }

    // Tính toán điểm số (Summary) luôn được phép xem
    const correctAnswersMap = new Map<string, string>();
    paper.answerKeys.forEach((key: any) => correctAnswersMap.set(key.originalQuestionId.toString(), key.correctAnswerId));

    const studentAnswersMap = new Map<string, string | null>();
    submission.answers.forEach((ans: any) => studentAnswersMap.set(ans.questionId.toString(), ans.selectedAnswerId));

    let correctCount = 0;
    const details = paper.questions.map((q: any) => {
      const qId = q.originalQuestionId.toString();
      const studentSelectedId = studentAnswersMap.get(qId) || null;
      const correctAnswerId = correctAnswersMap.get(qId) || null;

      if (studentSelectedId === correctAnswerId) correctCount++;

      return {
        originalQuestionId: qId,
        content: q.content,
        difficultyLevel: q.difficultyLevel,
        answers: q.answers,
        studentSelectedId,
        correctAnswerId,
        isCorrect: studentSelectedId === correctAnswerId
      };
    });

    // Nếu Rules cấm xem đáp án -> Xóa sạch mảng details
    return {
      status: 'COMPLETED',
      summary: {
        score: submission.score,
        totalQuestions: paper.questions.length,
        correctCount,
        incorrectCount: paper.questions.length - correctCount,
        submittedAt: submission.submittedAt,
        attemptNumber: submission.attemptNumber
      },
      message: canShowDetails ? 'Thành công' : 'Chi tiết đúng/sai được bảo mật theo cấu hình của bài học.',
      details: canShowDetails ? details : [] // Ngắt leak dữ liệu
    };
  }


  // ==========================================
  // UTILS: ANTI-CHEAT RANDOMIZER
  // ==========================================
  private shufflePaperForStudent(questions: any[], answerKeys: any[]) {
    const blocks: any[] = [];
    const passageMap = new Map<string, any>();

    for (const q of questions) {
      if (q.type === QuestionType.PASSAGE) {
        const block = { isPassage: true, passage: q, subQuestions: [] };
        passageMap.set(q.originalQuestionId.toString(), block);
        blocks.push(block);
      } else if (!q.parentPassageId) {
        blocks.push({ isPassage: false, question: q });
      }
    }

    for (const q of questions) {
      if (q.parentPassageId) {
        const parentBlock = passageMap.get(q.parentPassageId.toString());
        if (parentBlock) parentBlock.subQuestions.push(q);
      }
    }

    const shuffledBlocks = this._shuffleArray(blocks);
    const finalQuestions: any[] = [];

    for (const block of shuffledBlocks) {
      if (block.isPassage) {
        finalQuestions.push({ ...block.passage });
        const shuffledSubs = this._shuffleArray<{ answers: any[] }>(block.subQuestions);
        for (const sub of shuffledSubs) {
          finalQuestions.push({ ...sub, answers: this._shuffleArray(sub.answers) });
        }
      } else {
        finalQuestions.push({ ...block.question, answers: this._shuffleArray(block.question.answers) });
      }
    }

    return { questions: finalQuestions, answerKeys };
  }

  private _shuffleArray<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  async getStudentHistory(payload: { studentId: string; page?: number; limit?: number; courseId?: string; lessonId?: string; }) {
    const { studentId, page = 1, limit = 10, courseId, lessonId } = payload;

    return this.submissionsRepo.getStudentHistoryData(studentId, page, limit, courseId, lessonId);
  }
}