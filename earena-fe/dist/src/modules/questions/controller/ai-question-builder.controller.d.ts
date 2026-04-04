import { GenerateAiQuestionDto } from '../dto/ai-question-builder.dto';
import { AiQuestionBuilderService } from '../services/ai-question-builder.service';
export declare class AiQuestionBuilderController {
    private readonly aiQuestionBuilderService;
    constructor(aiQuestionBuilderService: AiQuestionBuilderService);
    generateQuestionsFromFile(teacherId: string, dto: GenerateAiQuestionDto, files: Express.Multer.File[]): Promise<{
        message: string;
        data: {
            status: string;
            questionsGenerated: number;
            message: string;
        };
    }>;
}
