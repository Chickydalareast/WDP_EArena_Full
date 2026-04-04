import { Connection, Types } from 'mongoose';
import { ExamsRepository } from './exams.repository';
import { ExamPapersRepository } from './exam-papers.repository';
import { QuestionsRepository } from '../questions/questions.repository';
import { QuestionFoldersRepository } from '../questions/question-folders.repository';
import { CoursesRepository } from '../courses/courses.repository';
import { LessonsRepository } from '../courses/repositories/lessons.repository';
import { ExamSubmissionsRepository } from './exam-submissions.repository';
import { UsersService } from '../users/users.service';
import { ExamType, ExamDocument } from './schemas/exam.schema';
import { PaperUpdateAction } from './dto';
import { UpdatePaperPointsPayload } from './interfaces/exams.interface';
export type InitManualExamPayload = {
    title: string;
    description?: string;
    totalScore: number;
    subjectId: string;
};
export type UpdatePaperQuestionsPayload = {
    action: PaperUpdateAction;
    questionId?: string;
    questionIds?: string[];
};
export type GetExamsPayload = {
    page: number;
    limit: number;
    search?: string;
    type?: ExamType;
    subjectId?: string;
};
export type UpdateExamPayload = {
    title?: string;
    description?: string;
    totalScore?: number;
};
export type GetLeaderboardPayload = {
    courseId: string;
    lessonId: string;
    page: number;
    limit: number;
    search?: string;
};
export declare class ExamsService {
    private readonly examsRepo;
    private readonly examPapersRepo;
    private readonly questionsRepo;
    private readonly coursesRepo;
    private readonly lessonsRepo;
    private readonly usersService;
    private readonly examSubmissionsRepo;
    private readonly foldersRepo;
    private readonly connection;
    private readonly logger;
    constructor(examsRepo: ExamsRepository, examPapersRepo: ExamPapersRepository, questionsRepo: QuestionsRepository, coursesRepo: CoursesRepository, lessonsRepo: LessonsRepository, usersService: UsersService, examSubmissionsRepo: ExamSubmissionsRepository, foldersRepo: QuestionFoldersRepository, connection: Connection);
    initManualExam(teacherId: string, payload: InitManualExamPayload): Promise<{
        message: string;
        examId: Types.ObjectId;
        paperId: Types.ObjectId;
    }>;
    private buildPaperDetailPayload;
    getPaperDetail(paperId: string, teacherId: string): Promise<{
        folderId: string | null;
        examId: Types.ObjectId;
        submissionId?: Types.ObjectId;
        questions: import("./schemas/exam-paper.schema").PaperQuestion[];
        answerKeys: import("./schemas/exam-paper.schema").PaperAnswerKey[];
        _id: Types.ObjectId;
        $locals: Record<string, unknown>;
        $op: "save" | "validate" | "remove" | null;
        $where: Record<string, unknown>;
        baseModelName?: string;
        collection: import("mongoose").Collection;
        db: Connection;
        errors?: import("mongoose").Error.ValidationError;
        isNew: boolean;
        schema: import("mongoose").Schema;
        __v: number;
    }>;
    getPaperDetailByExamIdForAdmin(examId: string): Promise<{
        folderId: string | null;
        examId: Types.ObjectId;
        submissionId?: Types.ObjectId;
        questions: import("./schemas/exam-paper.schema").PaperQuestion[];
        answerKeys: import("./schemas/exam-paper.schema").PaperAnswerKey[];
        _id: Types.ObjectId;
        $locals: Record<string, unknown>;
        $op: "save" | "validate" | "remove" | null;
        $where: Record<string, unknown>;
        baseModelName?: string;
        collection: import("mongoose").Collection;
        db: Connection;
        errors?: import("mongoose").Error.ValidationError;
        isNew: boolean;
        schema: import("mongoose").Schema;
        __v: number;
    }>;
    updatePaperQuestions(paperId: string, teacherId: string, payload: UpdatePaperQuestionsPayload): Promise<{
        message: string;
    } | undefined>;
    publishExam(examId: string, teacherId: string): Promise<{
        message: string;
    }>;
    getExams(teacherId: string, payload: GetExamsPayload): Promise<{
        items: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    updateExam(examId: string, teacherId: string, payload: UpdateExamPayload): Promise<{
        message: string;
        exam: ExamDocument | null;
    }>;
    getLeaderboard(teacherId: string, payload: GetLeaderboardPayload): Promise<{
        items: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    deleteExam(examId: string, teacherId: string): Promise<{
        message: string;
    }>;
    updatePaperPoints(paperId: string, teacherId: string, payload: UpdatePaperPointsPayload): Promise<{
        message: string;
    }>;
    unpublishAllQuizzesByCourse(courseId: string): Promise<void>;
}
