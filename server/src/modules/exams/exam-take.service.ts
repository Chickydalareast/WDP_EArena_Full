import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Types } from 'mongoose';
import { ExamSubmissionsRepository } from './exam-submissions.repository';
import { ExamPapersRepository } from './exam-papers.repository';
import { LessonsRepository } from '../courses/repositories/lessons.repository';
import { EnrollmentsService } from '../courses/services/enrollments.service';
import { ExamGeneratorService } from './exam-generator.service';
import { SubmissionStatus } from './schemas/exam-submission.schema';
import {
  GetExamPaperPayload,
  GetLessonAttemptsPayload,
  GetStudentHistoryOverviewPayload,
  GetStudentHistoryPayload,
  StartExamPayload,
} from './interfaces/exam-take.interface';
import { GenerateRawPaperPayload } from './interfaces/exam-generator.interface';
import { ExamMode, ExamType, ExamDocument } from './schemas/exam.schema';
import { QuestionType } from '../questions/schemas/question.schema';
import {
  ExamEventPattern,
  ExamSubmittedEventPayload,
} from './constants/exam-event.constant';
import { ShowResultMode } from '../courses/schemas/lesson.schema';
import { RedisService } from '../../common/redis/redis.service';
import { RuleQuestionType } from './interfaces/exam-matrix.interface';

import { CoursesRepository } from '../courses/courses.repository';
import { LessonProgressRepository } from '../courses/repositories/lesson-progress.repository';
import { ProgressionLockedException } from '../courses/exceptions/progression-locked.exception';

@Injectable()
export class ExamTakeService {
  private readonly logger = new Logger(ExamTakeService.name);

  constructor(
    private readonly submissionsRepo: ExamSubmissionsRepository,
    private readonly papersRepo: ExamPapersRepository,
    private readonly lessonsRepo: LessonsRepository,
    private readonly enrollmentsService: EnrollmentsService,
    private readonly examGeneratorService: ExamGeneratorService,
    private readonly redisService: RedisService,
    private readonly eventEmitter: EventEmitter2,
    private readonly coursesRepo: CoursesRepository,
    private readonly lessonProgressRepo: LessonProgressRepository,
  ) { }

  async getStudentExamPaper(payload: GetExamPaperPayload) {
    const { submissionId, studentId } = payload;

    if (!Types.ObjectId.isValid(submissionId)) {
      throw new BadRequestException('ID bài làm không hợp lệ.');
    }

    const submission = await this.submissionsRepo.findOneSafe(
      {
        _id: new Types.ObjectId(submissionId),
        studentId: new Types.ObjectId(studentId),
      },
      { populate: { path: 'lessonId', select: 'examRules' } }
    );

    if (!submission) {
      throw new NotFoundException('Không tìm thấy dữ liệu bài làm.');
    }

    if (submission.status !== SubmissionStatus.IN_PROGRESS) {
      throw new ForbiddenException('Bài thi này đã kết thúc, không thể xem lại đề trắng.');
    }

    const paper = await this.papersRepo.findPaperDetailWithRelations(submission.examPaperId);
    if (!paper) {
      throw new NotFoundException('Dữ liệu đề thi đã bị lỗi hoặc không tồn tại.');
    }

    const draftAnswers = await this.submissionsRepo.getDraftAnswersFromRedis(submissionId);

    const sanitizedQuestions = paper.questions.map((q: any) => {
      const qIdStr = q.originalQuestionId.toString();

      let currentSelectedAnswer = null;
      if (draftAnswers && draftAnswers[qIdStr]) {
        currentSelectedAnswer = draftAnswers[qIdStr];
      } else {
        const dbAns = submission.answers.find((a: any) => a.questionId.toString() === qIdStr);
        if (dbAns && dbAns.selectedAnswerId) {
          currentSelectedAnswer = dbAns.selectedAnswerId;
        }
      }

      return {
        originalQuestionId: q.originalQuestionId,
        type: q.type,
        parentPassageId: q.parentPassageId,
        orderIndex: q.orderIndex,
        content: q.content,
        difficultyLevel: q.difficultyLevel,
        answers: q.answers,
        attachedMedia: q.attachedMedia,
        points: q.points,
        selectedAnswerId: currentSelectedAnswer
      };
    });

    this.logger.verbose(`[ExamTake] User ${studentId} đã load đề thi của submission ${submissionId}`);

    const lessonData = submission.lessonId as any;
    const timeLimit = lessonData?.examRules?.timeLimit || 0;
    const startedAt = (submission._id as Types.ObjectId).getTimestamp().toISOString();

    return {
      submissionId: submission._id.toString(),
      examId: submission.examId.toString(),
      status: submission.status,
      timeLimit,
      startedAt,
      questions: sanitizedQuestions,
    };
  }

  private _mapAdHocSectionsForGenerator(adHocSections?: any[]) {
    if (!adHocSections || adHocSections.length === 0) return undefined;

    return adHocSections.map((sec) => ({
      name: sec.name,
      orderIndex: sec.orderIndex,
      rules: sec.rules.map((rule: any) => ({
        questionType: rule.questionType ?? RuleQuestionType.MIXED,
        subQuestionLimit: rule.subQuestionLimit,
        folderIds: rule.folderIds?.map((id: any) => id.toString()) || [],
        topicIds: rule.topicIds?.map((id: any) => id.toString()) || [],
        difficulties: rule.difficulties || [],
        tags: rule.tags || [],
        limit: rule.limit,
      })),
    }));
  }

  private async _checkStrictProgression(userId: string, courseId: string, lessonId: string) {
    const courseInfo = await this.coursesRepo.findByIdSafe(courseId, { select: 'progressionMode teacherId' });
    const mode = courseInfo?.progressionMode || 'FREE';

    if (mode === 'STRICT_LINEAR' && courseInfo?.teacherId?.toString() !== userId) {
      const currentLesson = await this.lessonsRepo.findByIdSafe(lessonId, {
        populate: [{ path: 'sectionId', select: 'order' }],
      });

      const sectionData = currentLesson?.sectionId as any;
      if (currentLesson && sectionData) {
        const prevLessonId = await this.lessonsRepo.getPreviousLessonId(
          courseId,
          sectionData.order,
          currentLesson.order,
        );

        if (prevLessonId) {
          const prevProgress = await this.lessonProgressRepo.findOneSafe(
            {
              userId: new Types.ObjectId(userId),
              lessonId: new Types.ObjectId(prevLessonId),
            },
            { select: 'isCompleted' },
          );

          if (!prevProgress || !prevProgress.isCompleted) {
            this.logger.warn(`[Security] Chặn User ${userId} spam API startExam (Bypass Strict Linear)`);
            throw new ProgressionLockedException(prevLessonId);
          }
        }
      }
    }
  }

  async startExam(payload: StartExamPayload) {
    const { studentId, courseId, lessonId } = payload;
    const studentObjId = new Types.ObjectId(studentId);
    const lessonObjId = new Types.ObjectId(lessonId);

    const hasAccess = await this.enrollmentsService.validateCourseExamAccess(
      studentId,
      courseId,
      lessonId,
    );
    if (!hasAccess) {
      throw new ForbiddenException('Bạn không có quyền truy cập bài thi này.');
    }

    await this._checkStrictProgression(studentId, courseId, lessonId);

    const lockKey = `exam:start:${studentId}:${lessonId}`;
    const lockUuid = await this.redisService.acquireLock(lockKey, 10);
    if (!lockUuid) {
      throw new ConflictException('Hệ thống đang xử lý, vui lòng không thao tác quá nhanh.');
    }

    try {
      const lesson = await this.lessonsRepo.findByIdSafe(lessonObjId, { populate: 'examId' });
      if (!lesson || !lesson.examId || lesson.courseId.toString() !== courseId) {
        throw new NotFoundException('Bài thi không tồn tại hoặc không hợp lệ.');
      }

      const exam = lesson.examId as unknown as ExamDocument;
      const timeLimit = lesson.examRules?.timeLimit || 0;

      const inProgressSub = await this.submissionsRepo.findOneSafe({
        studentId: studentObjId,
        lessonId: lessonObjId,
        status: SubmissionStatus.IN_PROGRESS,
      });

      if (inProgressSub) {
        const startedAtMs = (inProgressSub._id as Types.ObjectId).getTimestamp().getTime();
        const timeLimitMs = timeLimit * 60 * 1000;
        const NETWORK_BUFFER_MS = 60000;

        if (timeLimit > 0 && Date.now() > startedAtMs + timeLimitMs + NETWORK_BUFFER_MS) {
          this.logger.warn(`[ExamTake] User ${studentId} có phiên thi ${inProgressSub._id} quá hạn. Tự động chuyển sang ABANDONED.`);
          await this.submissionsRepo.updateByIdSafe(inProgressSub._id, {
            $set: { status: SubmissionStatus.ABANDONED },
          });
        } else {
          return {
            message: 'Tiếp tục bài thi đang dang dở.',
            submissionId: inProgressSub._id.toString(),
            examPaperId: inProgressSub.examPaperId.toString(),
            timeLimit,
            startedAt: new Date(startedAtMs).toISOString(),
          };
        }
      }

      const maxAttempts = lesson.examRules?.maxAttempts ?? 1;
      
      const completedCount = await this.submissionsRepo.modelInstance.countDocuments({
        studentId: studentObjId,
        lessonId: lessonObjId,
        status: { $in: [SubmissionStatus.COMPLETED, SubmissionStatus.ABANDONED] },
      });

      if (maxAttempts > 0 && completedCount >= maxAttempts) {
        throw new ForbiddenException(`Bạn đã sử dụng hết số lượt thi cho phép (${maxAttempts}/${maxAttempts}).`);
      }

      let paperQuestions: any[] = [];
      let answerKeys: any[] = [];

      if (exam.mode === ExamMode.DYNAMIC) {
        const dynamicPayload: GenerateRawPaperPayload = {
          teacherId: exam.teacherId.toString(),
          totalScore: exam.totalScore,
          matrixId: exam.dynamicConfig?.matrixId?.toString(),
          adHocSections: this._mapAdHocSectionsForGenerator(exam.dynamicConfig?.adHocSections),
        };

        const dynamicResult = await this.examGeneratorService.generateRawPaperContent(dynamicPayload);

        paperQuestions = dynamicResult.questions;
        answerKeys = dynamicResult.answerKeys;
      } else {
        const defaultPaper = await this.papersRepo.findOneSafe({ examId: exam._id, submissionId: null });
        if (!defaultPaper) {
          throw new InternalServerErrorException('Đề thi tĩnh chưa được thiết lập câu hỏi.');
        }

        paperQuestions = defaultPaper.questions.map((q: any) => ({
          ...q,
          answers: this._shuffleArray(q.answers),
        }));
        answerKeys = defaultPaper.answerKeys;
      }

      const newSubmission = await this.submissionsRepo.executeInTransaction(async () => {
        const newPaper = await this.papersRepo.createDocument({
          examId: exam._id,
          submissionId: null,
          questions: paperQuestions,
          answerKeys: answerKeys,
        });

        const submission = await this.submissionsRepo.createDocument({
          studentId: studentObjId,
          courseId: new Types.ObjectId(courseId),
          lessonId: lessonObjId,
          examId: exam._id,
          examPaperId: newPaper._id as any,
          attemptNumber: completedCount + 1,
          answers: paperQuestions.map(q => ({
            questionId: q.originalQuestionId,
            selectedAnswerId: null,
          })),
          status: SubmissionStatus.IN_PROGRESS,
        });

        await this.papersRepo.updateByIdSafe(newPaper._id.toString(), {
          $set: { submissionId: submission._id as any },
        });

        return submission;
      });

      this.logger.log(`[ExamTake] User ${studentId} started Exam ${exam._id} (Attempt: ${completedCount + 1})`);

      return {
        message: 'Bắt đầu làm bài thành công.',
        submissionId: newSubmission._id.toString(),
        examPaperId: newSubmission.examPaperId.toString(),
        timeLimit,
        startedAt: (newSubmission._id as Types.ObjectId).getTimestamp().toISOString(),
      };
    } finally {
      await this.redisService.releaseLockSafe(lockKey, lockUuid);
    }
  }

async submitExam(payload: { submissionId: string; studentId: string }) {
    const { submissionId, studentId } = payload;

    const submission = await this.submissionsRepo.findOneSafe(
      {
        _id: new Types.ObjectId(submissionId),
        studentId: new Types.ObjectId(studentId),
      },
      { populate: { path: 'lessonId', select: 'examRules' } }
    );

    if (!submission) throw new NotFoundException('Không tìm thấy bài thi.');
    if (submission.status !== SubmissionStatus.IN_PROGRESS) {
      throw new ConflictException('Bài thi này đã được nộp hoặc đã bị hủy.');
    }

    const lessonData = submission.lessonId as any;
    const timeLimit = lessonData?.examRules?.timeLimit || 0;
    const startedAtMs = (submission._id as Types.ObjectId).getTimestamp().getTime();
    const timeLimitMs = timeLimit * 60 * 1000;
    const NETWORK_BUFFER_MS = 60000; 

    if (timeLimit > 0 && Date.now() > startedAtMs + timeLimitMs + NETWORK_BUFFER_MS) {
      await this.submissionsRepo.updateByIdSafe(submission._id, {
        $set: { status: SubmissionStatus.ABANDONED }
      });
      this.logger.warn(`[Security] Học viên ${studentId} cố tình nộp bài trễ. Đã đánh dấu ABANDONED!`);
      throw new BadRequestException('Đã quá thời gian làm bài cho phép.');
    }

    const success = await this.submissionsRepo.syncRedisToMongoOnSubmit(submissionId, studentId);
    
    if (!success) {
      throw new InternalServerErrorException('Lỗi đồng bộ dữ liệu khi nộp bài.');
    }

    const eventPayload: ExamSubmittedEventPayload = { submissionId, studentId };
    this.eventEmitter.emit(ExamEventPattern.EXAM_SUBMITTED, eventPayload);

    this.logger.log(`[Assessment Engine] Học viên ${studentId} nộp bài ${submissionId}. Đã phát sự kiện chấm điểm.`);

    return {
      message: 'Nộp bài thành công. Hệ thống đang tiến hành chấm điểm.',
      status: 'GRADING_IN_PROGRESS',
    };
  }

  async autoSaveAnswer(payload: {
    submissionId: string;
    studentId: string;
    questionId: string;
    selectedAnswerId: string;
  }) {
    const { submissionId, studentId, questionId, selectedAnswerId } = payload;
    await this.submissionsRepo.saveDraftToRedis(
      submissionId,
      questionId,
      selectedAnswerId,
    );
    return { success: true };
  }

  // async submitExam(payload: { submissionId: string; studentId: string }) {
  //   const { submissionId, studentId } = payload;

  //   const submission = await this.submissionsRepo.findOneSafe(
  //     {
  //       _id: new Types.ObjectId(submissionId),
  //       studentId: new Types.ObjectId(studentId),
  //     },
  //     { populate: 'lessonId' },
  //   );

  //   if (!submission) throw new NotFoundException('Bài thi không tồn tại.');
  //   if (submission.status !== SubmissionStatus.IN_PROGRESS) {
  //     throw new BadRequestException(
  //       'Bài thi đã được nộp hoặc trạng thái không hợp lệ.',
  //     );
  //   }

  //   const lesson = submission.lessonId as any;
  //   const timeLimit = lesson?.examRules?.timeLimit || 0;

  //   if (timeLimit > 0) {
  //     const startTimeMs = new Types.ObjectId(submission._id.toString())
  //       .getTimestamp()
  //       .getTime();
  //     const nowMs = Date.now();
  //     const allowedTimeMs = timeLimit * 60 * 1000;
  //     const networkBufferMs = 60 * 1000;

  //     if (nowMs > startTimeMs + allowedTimeMs + networkBufferMs) {
  //       this.logger.warn(
  //         `[Security] Học viên ${studentId} cố tình nộp bài trễ. Bị block!`,
  //       );
  //       throw new BadRequestException(
  //         'Đã quá thời gian làm bài cho phép. Bài làm không được chấp nhận.',
  //       );
  //     }
  //   }

  //   const success = await this.submissionsRepo.syncRedisToMongoOnSubmit(
  //     submissionId,
  //     studentId,
  //   );
  //   if (!success)
  //     throw new InternalServerErrorException('Có lỗi xảy ra khi nộp bài.');

  //   const eventPayload: ExamSubmittedEventPayload = { submissionId, studentId };
  //   this.eventEmitter.emit(ExamEventPattern.EXAM_SUBMITTED, eventPayload);

  //   this.logger.log(
  //     `[Assessment Engine] Học viên ${studentId} nộp bài ${submissionId}. Đã phát sự kiện chấm điểm.`,
  //   );
  //   return { message: 'Nộp bài thành công, hệ thống đang chấm điểm.' };
  // }

  async getSubmissionResult(submissionId: string, studentId: string) {
    if (!Types.ObjectId.isValid(submissionId))
      throw new BadRequestException('Mã bài thi không hợp lệ.');

    const submission = await this.submissionsRepo.findOneSafe(
      {
        _id: new Types.ObjectId(submissionId),
        studentId: new Types.ObjectId(studentId),
      },
      { populate: 'lessonId' },
    );

    if (!submission) throw new NotFoundException('Không tìm thấy bài thi.');
    if (submission.status !== SubmissionStatus.COMPLETED)
      throw new ForbiddenException('Bài thi chưa được nộp.');

    if (submission.score === null) {
      return {
        status: 'GRADING_IN_PROGRESS',
        message: 'Hệ thống đang chấm điểm. Vui lòng không thoát trang.',
        retryAfter: 2000,
      };
    }

    const paper = await this.papersRepo.findByIdSafe(submission.examPaperId, {
      select: '+answerKeys',
    });
    if (!paper)
      throw new InternalServerErrorException(
        'Lỗi hệ thống: Mất liên kết Snapshot đề thi.',
      );

    const lesson = submission.lessonId as any;
    const showResultMode =
      lesson?.examRules?.showResultMode || ShowResultMode.IMMEDIATELY;
    const timeLimit = lesson?.examRules?.timeLimit || 0;

    let canShowDetails = true;
    if (showResultMode === ShowResultMode.NEVER) {
      canShowDetails = false;
    } else if (showResultMode === ShowResultMode.AFTER_END_TIME) {
      if (timeLimit > 0) {
        const startTimeMs = new Types.ObjectId(submission._id.toString())
          .getTimestamp()
          .getTime();
        const endTimeMs = startTimeMs + timeLimit * 60 * 1000;
        if (Date.now() < endTimeMs) {
          canShowDetails = false;
        }
      }
    }

    const correctAnswersMap = new Map<string, string>();
    paper.answerKeys.forEach((key: any) =>
      correctAnswersMap.set(
        key.originalQuestionId.toString(),
        key.correctAnswerId,
      ),
    );

    const studentAnswersMap = new Map<string, string | null>();
    submission.answers.forEach((ans: any) =>
      studentAnswersMap.set(ans.questionId.toString(), ans.selectedAnswerId),
    );

    const answerableQuestions = paper.questions.filter(
      (q: any) => q.type !== QuestionType.PASSAGE,
    );
    const totalQuestions = answerableQuestions.length;

    let correctCount = 0;

    const details = answerableQuestions.map((q: any) => {
      const qId = q.originalQuestionId.toString();
      const studentSelectedId = studentAnswersMap.get(qId) || null;
      const correctAnswerId = correctAnswersMap.get(qId) || null;

      const isCorrect =
        studentSelectedId !== null && studentSelectedId === correctAnswerId;
      if (isCorrect) correctCount++;

      return {
        originalQuestionId: qId,
        content: q.content,
        difficultyLevel: q.difficultyLevel,
        answers: q.answers,
        studentSelectedId,
        correctAnswerId,
        isCorrect,
      };
    });

    return {
      status: 'COMPLETED',
      summary: {
        score: submission.score,
        totalQuestions,
        correctCount,
        incorrectCount: totalQuestions - correctCount,
        submittedAt: submission.submittedAt,
        attemptNumber: submission.attemptNumber,
      },
      message: canShowDetails
        ? 'Thành công'
        : 'Chi tiết đúng/sai được bảo mật theo cấu hình của bài học.',
      details: canShowDetails ? details : [],
    };
  }

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
        const shuffledSubs = this._shuffleArray<{ answers: any[] }>(
          block.subQuestions,
        );
        for (const sub of shuffledSubs) {
          finalQuestions.push({
            ...sub,
            answers: this._shuffleArray(sub.answers),
          });
        }
      } else {
        finalQuestions.push({
          ...block.question,
          answers: this._shuffleArray(block.question.answers),
        });
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

  async getStudentHistory(payload: GetStudentHistoryPayload) {
    const { studentId, page = 1, limit = 10, courseId, lessonId } = payload;
    return this.submissionsRepo.getStudentHistoryData(
      studentId,
      page,
      limit,
      courseId,
      lessonId,
    );
  }

  async getStudentHistoryOverview(payload: GetStudentHistoryOverviewPayload) {
    const { studentId, page, limit, courseId } = payload;
    return this.submissionsRepo.getStudentHistoryOverviewData(
      studentId,
      page,
      limit,
      courseId,
    );
  }

  async getLessonAttempts(payload: GetLessonAttemptsPayload) {
    const { studentId, lessonId, page, limit } = payload;
    return this.submissionsRepo.getLessonAttemptsData(
      studentId,
      lessonId,
      page,
      limit,
    );
  }
}