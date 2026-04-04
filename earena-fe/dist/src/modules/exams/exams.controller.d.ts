import { ExamsService } from './exams.service';
import { ExamGeneratorService } from './exam-generator.service';
import { InitManualExamDto, UpdatePaperQuestionsDto, GetExamsDto, UpdateExamDto, GetLeaderboardDto } from './dto';
import { GenerateDynamicExamDto } from './dto/generate-exam.dto';
import { FillFromMatrixDto } from './dto/fill-from-matrix.dto';
import { UpdatePaperPointsDto } from './dto/update-paper-points.dto';
import { MatrixRuleDto } from './dto/exam-matrix.dto';
import { PreviewDynamicExamDto } from './dto/preview-dynamic-exam.dto';
export declare class ExamsController {
    private readonly examsService;
    private readonly examGeneratorService;
    constructor(examsService: ExamsService, examGeneratorService: ExamGeneratorService);
    initManualExam(dto: InitManualExamDto, userId: string): Promise<{
        message: string;
        examId: import("mongoose").Types.ObjectId;
        paperId: import("mongoose").Types.ObjectId;
    }>;
    updatePaperQuestions(paperId: string, dto: UpdatePaperQuestionsDto, userId: string): Promise<{
        message: string;
    } | undefined>;
    generateDynamicExam(dto: GenerateDynamicExamDto, userId: string): Promise<{
        message: string;
        examId: import("mongoose").Types.ObjectId;
        paperId: import("mongoose").Types.ObjectId;
        totalItems: number;
        totalActualQuestions: number;
    }>;
    previewDynamicExam(userId: string, dto: PreviewDynamicExamDto): Promise<{
        message: string;
        totalItems: number;
        totalActualQuestions: number;
        previewData: {
            questions: any[];
            answerKeys: any[];
        };
    }>;
    getExams(dto: GetExamsDto, userId: string): Promise<{
        items: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getPaperDetail(paperId: string, userId: string): Promise<{
        folderId: string | null;
        examId: import("mongoose").Types.ObjectId;
        submissionId?: import("mongoose").Types.ObjectId;
        questions: import("./schemas/exam-paper.schema").PaperQuestion[];
        answerKeys: import("./schemas/exam-paper.schema").PaperAnswerKey[];
        _id: import("mongoose").Types.ObjectId;
        $locals: Record<string, unknown>;
        $op: "save" | "validate" | "remove" | null;
        $where: Record<string, unknown>;
        baseModelName?: string;
        collection: import("mongoose").Collection;
        db: import("mongoose").Connection;
        errors?: import("mongoose").Error.ValidationError;
        isNew: boolean;
        schema: import("mongoose").Schema;
        __v: number;
    }>;
    updateExam(examId: string, dto: UpdateExamDto, userId: string): Promise<{
        message: string;
        exam: import("./schemas/exam.schema").ExamDocument | null;
    }>;
    deleteExam(examId: string, userId: string): Promise<{
        message: string;
    }>;
    getLeaderboard(courseId: string, lessonId: string, dto: GetLeaderboardDto, userId: string): Promise<{
        items: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    publishExam(examId: string, userId: string): Promise<{
        message: string;
    }>;
    fillExistingPaperFromMatrix(paperId: string, dto: FillFromMatrixDto, userId: string): Promise<{
        message: string;
        addedItems: number;
        addedActualQuestions: number;
    }>;
    updatePaperPoints(paperId: string, dto: UpdatePaperPointsDto, userId: string): Promise<{
        message: string;
    }>;
    previewMatrixRule(paperId: string, dto: MatrixRuleDto, userId: string): Promise<{
        message: string;
        availableQuestionsCount: number;
    }>;
}
