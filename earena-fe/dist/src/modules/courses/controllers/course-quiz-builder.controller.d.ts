import { Types } from 'mongoose';
import { CreateCourseQuizDto, DeleteCourseQuizDto, GetQuizMatricesDto, PreviewQuizConfigDto, RulePreviewDto, UpdateCourseQuizDto } from '../dto/course-quiz-builder.dto';
import { CourseQuizBuilderService } from '../services/course-quiz-builder.service';
export declare class CourseQuizBuilderController {
    private readonly courseQuizBuilderService;
    constructor(courseQuizBuilderService: CourseQuizBuilderService);
    private mapDynamicConfig;
    createQuizLesson(teacherId: string, dto: CreateCourseQuizDto): Promise<{
        message: string;
        data: any;
    }>;
    updateQuizLesson(teacherId: string, dto: UpdateCourseQuizDto): Promise<{
        message: string;
        data: any;
    }>;
    deleteQuizLesson(teacherId: string, dto: DeleteCourseQuizDto): Promise<{
        message: string;
    }>;
    getCompatibleMatrices(teacherId: string, dto: GetQuizMatricesDto): Promise<{
        message: string;
        data: {
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
        };
    }>;
    getRuleAvailableCount(teacherId: string, dto: RulePreviewDto): Promise<{
        message: string;
        data: import("../interfaces/course-quiz-builder.interface").RulePreviewResult;
    }>;
    previewQuizConfig(teacherId: string, dto: PreviewQuizConfigDto): Promise<{
        message: string;
        data: {
            totalItems: number;
            totalActualQuestions: number;
            previewData: {
                questions: any[];
                answerKeys: any[];
            };
        };
    }>;
    getQuizHealth(teacherId: string, courseId: string, lessonId: string): Promise<{
        message: string;
        data: import("../interfaces/course-quiz-builder.interface").QuizHealthResult;
    }>;
    getQuizAnalytics(teacherId: string, courseId: string, lessonId: string): Promise<{
        message: string;
        data: {
            passRate: number;
            averageScore: number;
            totalCompletedSubmissions: any;
            scoreDistribution: any;
            topWrongQuestions: any;
        };
    }>;
    getTeacherAttemptHistory(teacherId: string, courseId: string, lessonId: string, page?: number, limit?: number, search?: string): Promise<{
        message: string;
        data: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    assignStaticQuestions(teacherId: string, courseId: string, lessonId: string, questionIds: string[]): Promise<{
        message: string;
        data: {
            totalAssigned: any;
        };
    }>;
}
