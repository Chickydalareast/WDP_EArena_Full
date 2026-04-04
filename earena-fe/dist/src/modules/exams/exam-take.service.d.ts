import { EventEmitter2 } from '@nestjs/event-emitter';
import { Types } from 'mongoose';
import { ExamSubmissionsRepository } from './exam-submissions.repository';
import { ExamPapersRepository } from './exam-papers.repository';
import { LessonsRepository } from '../courses/repositories/lessons.repository';
import { EnrollmentsService } from '../courses/services/enrollments.service';
import { ExamGeneratorService } from './exam-generator.service';
import { SubmissionStatus } from './schemas/exam-submission.schema';
import { GetLessonAttemptsPayload, GetStudentHistoryOverviewPayload, GetStudentHistoryPayload, StartExamPayload } from './interfaces/exam-take.interface';
import { RedisService } from '../../common/redis/redis.service';
export declare class ExamTakeService {
    private readonly submissionsRepo;
    private readonly papersRepo;
    private readonly lessonsRepo;
    private readonly enrollmentsService;
    private readonly examGeneratorService;
    private readonly eventEmitter;
    private readonly redisService;
    private readonly logger;
    constructor(submissionsRepo: ExamSubmissionsRepository, papersRepo: ExamPapersRepository, lessonsRepo: LessonsRepository, enrollmentsService: EnrollmentsService, examGeneratorService: ExamGeneratorService, eventEmitter: EventEmitter2, redisService: RedisService);
    startExam(payload: StartExamPayload): Promise<{
        submissionId: Types.ObjectId;
        status: SubmissionStatus.IN_PROGRESS;
        timeLimit: number;
        startedAt: string;
        paper: {
            questions: import("./schemas/exam-paper.schema").PaperQuestion[];
        };
    } | {
        submissionId: string;
        status: SubmissionStatus;
        timeLimit: number;
        startedAt: string;
        paper: {
            questions: any[];
        };
    }>;
    autoSaveAnswer(payload: {
        submissionId: string;
        studentId: string;
        questionId: string;
        selectedAnswerId: string;
    }): Promise<{
        success: boolean;
    }>;
    submitExam(payload: {
        submissionId: string;
        studentId: string;
    }): Promise<{
        message: string;
    }>;
    getSubmissionResult(submissionId: string, studentId: string): Promise<{
        status: string;
        message: string;
        retryAfter: number;
        summary?: undefined;
        details?: undefined;
    } | {
        status: string;
        summary: {
            score: number;
            totalQuestions: number;
            correctCount: number;
            incorrectCount: number;
            submittedAt: Date;
            attemptNumber: number;
        };
        message: string;
        details: {
            originalQuestionId: any;
            content: any;
            difficultyLevel: any;
            answers: any;
            studentSelectedId: string | null;
            correctAnswerId: string | null;
            isCorrect: boolean;
        }[];
        retryAfter?: undefined;
    }>;
    private shufflePaperForStudent;
    private _shuffleArray;
    getStudentHistory(payload: GetStudentHistoryPayload): Promise<{
        data: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getStudentHistoryOverview(payload: GetStudentHistoryOverviewPayload): Promise<{
        data: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getLessonAttempts(payload: GetLessonAttemptsPayload): Promise<{
        data: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
}
