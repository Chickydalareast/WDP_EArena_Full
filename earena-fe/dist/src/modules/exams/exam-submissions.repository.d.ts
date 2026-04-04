import { Logger } from '@nestjs/common';
import { Connection, Model, Types } from 'mongoose';
import { AbstractRepository } from '../../common/database/abstract.repository';
import { ExamSubmissionDocument } from './schemas/exam-submission.schema';
import { RedisService } from 'src/common/redis/redis.service';
export declare class ExamSubmissionsRepository extends AbstractRepository<ExamSubmissionDocument> {
    private readonly submissionModel;
    private readonly redisService;
    protected readonly logger: Logger;
    constructor(submissionModel: Model<ExamSubmissionDocument>, connection: Connection, redisService: RedisService);
    initSubmission(examId: string, examPaperId: string, studentId: string, questionIds: Types.ObjectId[]): Promise<ExamSubmissionDocument>;
    atomicAutoSave(submissionId: string, questionId: string, selectedAnswerId: string): Promise<boolean>;
    saveDraftToRedis(submissionId: string, questionId: string, selectedAnswerId: string): Promise<void>;
    getDraftAnswersFromRedis(submissionId: string): Promise<Record<string, string>>;
    syncRedisToMongoOnSubmit(submissionId: string, studentId: string): Promise<boolean>;
    private markAsCompleted;
    getLeaderboardData(courseId: string, lessonId: string, page: number, limit: number, search?: string): Promise<{
        items: any;
        total: any;
    }>;
    findLatestSubmission(studentId: string, lessonId: string): Promise<ExamSubmissionDocument | null>;
    getStudentHistoryData(studentId: string, page: number, limit: number, courseId?: string, lessonId?: string): Promise<{
        data: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getStudentHistoryOverviewData(studentId: string, page: number, limit: number, courseId?: string): Promise<{
        data: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getLessonAttemptsData(studentId: string, lessonId: string, page: number, limit: number): Promise<{
        data: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getTeacherAttemptHistoryData(courseId: string, lessonId: string, page: number, limit: number, search?: string): Promise<{
        data: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getQuizAnalyticsData(lessonId: string, passPercentage: number, totalScore: number): Promise<{
        passRate: number;
        averageScore: number;
        totalCompletedSubmissions: any;
        scoreDistribution: any;
        topWrongQuestions: any;
    }>;
}
