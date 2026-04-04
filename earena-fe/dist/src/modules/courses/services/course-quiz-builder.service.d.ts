import { Types } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CoursesRepository } from '../courses.repository';
import { SectionsRepository } from '../repositories/sections.repository';
import { LessonsRepository } from '../repositories/lessons.repository';
import { EnrollmentsRepository } from '../repositories/enrollments.repository';
import { ExamsRepository } from '../../exams/exams.repository';
import { RedisService } from '../../../common/redis/redis.service';
import { CreateCourseQuizParams, UpdateCourseQuizParams, DeleteCourseQuizParams, GetQuizMatricesParams, PreviewQuizConfigParams, RulePreviewResult, RulePreviewParams, GetQuizHealthParams, QuizHealthResult } from '../interfaces/course-quiz-builder.interface';
import { ExamGeneratorService } from 'src/modules/exams/exam-generator.service';
import { ExamMatricesService } from 'src/modules/exams/exam-matrices.service';
import { ExamSubmissionsRepository } from 'src/modules/exams/exam-submissions.repository';
import { QuestionsRepository } from 'src/modules/questions/questions.repository';
import { ExamPapersRepository } from 'src/modules/exams/exam-papers.repository';
export declare class CourseQuizBuilderService {
    private readonly coursesRepo;
    private readonly sectionsRepo;
    private readonly lessonsRepo;
    private readonly examsRepo;
    private readonly enrollmentsRepo;
    private readonly submissionsRepo;
    private readonly questionsRepo;
    private readonly examPapersRepo;
    private readonly redisService;
    private readonly eventEmitter;
    private readonly examMatricesService;
    private readonly examGeneratorService;
    private readonly logger;
    constructor(coursesRepo: CoursesRepository, sectionsRepo: SectionsRepository, lessonsRepo: LessonsRepository, examsRepo: ExamsRepository, enrollmentsRepo: EnrollmentsRepository, submissionsRepo: ExamSubmissionsRepository, questionsRepo: QuestionsRepository, examPapersRepo: ExamPapersRepository, redisService: RedisService, eventEmitter: EventEmitter2, examMatricesService: ExamMatricesService, examGeneratorService: ExamGeneratorService);
    private validateCourseOwnership;
    private checkStructureLock;
    createUnifiedQuizLesson(params: CreateCourseQuizParams): Promise<any>;
    deleteUnifiedQuizLesson(params: DeleteCourseQuizParams): Promise<void>;
    getMatricesByCourseSubject(params: GetQuizMatricesParams): Promise<{
        items: (import("../../exams/schemas/exam-matrix.schema").ExamMatrix & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getAvailableCountForRule(params: RulePreviewParams): Promise<RulePreviewResult>;
    previewQuizConfig(params: PreviewQuizConfigParams): Promise<{
        message: string;
        totalItems: number;
        totalActualQuestions: number;
        previewData: {
            questions: any[];
            answerKeys: any[];
        };
    }>;
    updateUnifiedQuizLesson(params: UpdateCourseQuizParams): Promise<any>;
    getQuizHealth(params: GetQuizHealthParams): Promise<QuizHealthResult>;
    getQuizAnalyticsData(teacherId: string, courseId: string, lessonId: string): Promise<{
        passRate: number;
        averageScore: number;
        totalCompletedSubmissions: any;
        scoreDistribution: any;
        topWrongQuestions: any;
    }>;
    getTeacherAttemptHistory(teacherId: string, courseId: string, lessonId: string, page: number, limit: number, search?: string): Promise<{
        data: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    assignStaticQuestions(teacherId: string, courseId: string, lessonId: string, questionIds: string[]): Promise<{
        totalAssigned: any;
    }>;
}
