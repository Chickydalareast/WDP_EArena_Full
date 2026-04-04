import { AiQuestionBuilderPayload } from '../interfaces/ai-question-builder.interface';
import { QuestionFoldersRepository } from '../question-folders.repository';
import { UsersService } from '../../users/users.service';
import { AiService } from '../../ai/ai.service';
import { KnowledgeTopicsService } from '../../taxonomy/knowledge-topics.service';
import { QuestionsService } from '../questions.service';
export declare class AiQuestionBuilderService {
    private readonly foldersRepo;
    private readonly usersService;
    private readonly aiService;
    private readonly topicsService;
    private readonly questionsService;
    private readonly logger;
    constructor(foldersRepo: QuestionFoldersRepository, usersService: UsersService, aiService: AiService, topicsService: KnowledgeTopicsService, questionsService: QuestionsService);
    generateQuestionBank(payload: AiQuestionBuilderPayload): Promise<{
        status: string;
        questionsGenerated: number;
        message: string;
    }>;
    private extractJsonFromAiResponse;
    private flattenTopicTree;
    private buildExamSetterPrompt;
    private cleanupTempFiles;
}
