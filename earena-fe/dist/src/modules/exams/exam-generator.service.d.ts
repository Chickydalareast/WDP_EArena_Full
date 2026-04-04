import { Types } from 'mongoose';
import { QuestionsRepository } from '../questions/questions.repository';
import { ExamsRepository } from './exams.repository';
import { ExamPapersRepository } from './exam-papers.repository';
import { ExamMatricesService } from './exam-matrices.service';
import { QuestionFoldersRepository } from '../questions/question-folders.repository';
import { KnowledgeTopicsRepository } from '../taxonomy/knowledge-topics.repository';
import { RedisService } from '../../common/redis/redis.service';
import { FillExistingPaperPayload, GenerateDynamicExamPayload, PreviewRulePayload, PreviewDynamicExamPayload } from './interfaces/exam-generator.interface';
import { DifficultyLevel } from '../questions/schemas/question.schema';
export declare class ExamGeneratorService {
    private readonly questionsRepo;
    private readonly examsRepo;
    private readonly examPapersRepo;
    private readonly matricesService;
    private readonly foldersRepo;
    private readonly topicsRepo;
    private readonly redisService;
    private readonly logger;
    constructor(questionsRepo: QuestionsRepository, examsRepo: ExamsRepository, examPapersRepo: ExamPapersRepository, matricesService: ExamMatricesService, foldersRepo: QuestionFoldersRepository, topicsRepo: KnowledgeTopicsRepository, redisService: RedisService);
    private expandHierarchyIds;
    private shuffleArray;
    private mapQuestionToPaper;
    private buildQuestionsFromSections;
    private resolveSectionsToProcess;
    previewDynamicExam(payload: PreviewDynamicExamPayload): Promise<{
        message: string;
        totalItems: number;
        totalActualQuestions: number;
        previewData: {
            questions: any[];
            answerKeys: any[];
        };
    }>;
    generateDynamicExam(payload: GenerateDynamicExamPayload): Promise<{
        message: string;
        examId: Types.ObjectId;
        paperId: Types.ObjectId;
        totalItems: number;
        totalActualQuestions: number;
    }>;
    fillExistingPaperFromMatrix(payload: FillExistingPaperPayload): Promise<{
        message: string;
        addedItems: number;
        addedActualQuestions: number;
    }>;
    previewRuleAvailability(payload: PreviewRulePayload): Promise<{
        message: string;
        availableQuestionsCount: number;
    }>;
    generateJitPaperFromMatrix(teacherId: string, totalScore: number, matrixId?: string, adHocSections?: any[]): Promise<{
        questions: any[];
        answerKeys: any[];
    }>;
    countAvailableForRule(teacherId: string, rule: {
        folderIds?: string[];
        topicIds?: string[];
        difficulties?: DifficultyLevel[];
        tags?: string[];
        limit: number;
    }): Promise<number>;
}
