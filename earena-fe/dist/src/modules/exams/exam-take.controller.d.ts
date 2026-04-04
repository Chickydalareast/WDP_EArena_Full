import { ExamTakeService } from './exam-take.service';
import { StartExamDto, AutoSaveDto, GetStudentHistoryDto, GetStudentHistoryOverviewDto, GetLessonAttemptsParamDto, GetLessonAttemptsQueryDto } from './dto/exam-take.dto';
export declare class ExamTakeController {
    private readonly examTakeService;
    constructor(examTakeService: ExamTakeService);
    startExam(userId: string, dto: StartExamDto): Promise<{
        submissionId: import("mongoose").Types.ObjectId;
        status: import("./schemas/exam-submission.schema").SubmissionStatus.IN_PROGRESS;
        timeLimit: number;
        startedAt: string;
        paper: {
            questions: import("./schemas/exam-paper.schema").PaperQuestion[];
        };
    } | {
        submissionId: string;
        status: import("./schemas/exam-submission.schema").SubmissionStatus;
        timeLimit: number;
        startedAt: string;
        paper: {
            questions: any[];
        };
    }>;
    autoSave(submissionId: string, dto: AutoSaveDto, studentId: string): Promise<{
        success: boolean;
    }>;
    submitExam(submissionId: string, studentId: string): Promise<{
        message: string;
    }>;
    getResult(submissionId: string, studentId: string): Promise<{
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
    getHistory(dto: GetStudentHistoryDto, studentId: string): Promise<{
        data: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getHistoryOverview(dto: GetStudentHistoryOverviewDto, studentId: string): Promise<{
        data: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getLessonAttempts(params: GetLessonAttemptsParamDto, query: GetLessonAttemptsQueryDto, studentId: string): Promise<{
        data: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
}
