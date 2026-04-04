import { FileValidator } from '@nestjs/common';
import { AiService } from './ai.service';
import { TestAiDto } from './dto/test-ai.dto';
import { AnalyzeDocumentDto } from './dto/analyze-document.dto';
export declare class StrictFileTypeValidator extends FileValidator<any> {
    constructor();
    isValid(file: Express.Multer.File): boolean;
    buildErrorMessage(file: Express.Multer.File): string;
}
export declare class AiTestController {
    private readonly aiService;
    constructor(aiService: AiService);
    testChat(dto: TestAiDto): Promise<{
        message: string;
        data: import("./interfaces/ai-provider.interface").AiStandardResponse;
    }>;
    analyzeDocument(dto: AnalyzeDocumentDto, file: Express.Multer.File): Promise<{
        message: string;
        data: import("./interfaces/ai-provider.interface").AiStandardResponse;
    }>;
}
