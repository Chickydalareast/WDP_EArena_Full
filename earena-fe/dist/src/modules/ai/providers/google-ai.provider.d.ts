import { ConfigService } from '@nestjs/config';
import { IAiProvider, AiProviderName, AiStandardResponse, GenerateTextPayload, AnalyzeDocumentPayload } from '../interfaces/ai-provider.interface';
export declare class GoogleAiProvider implements IAiProvider {
    private readonly configService;
    readonly providerName = AiProviderName.GOOGLE;
    private readonly logger;
    private client;
    constructor(configService: ConfigService);
    generateText(payload: Omit<GenerateTextPayload, 'providerName'>): Promise<AiStandardResponse>;
    analyzeDocument(payload: Omit<AnalyzeDocumentPayload, 'providerName'>): Promise<AiStandardResponse>;
}
