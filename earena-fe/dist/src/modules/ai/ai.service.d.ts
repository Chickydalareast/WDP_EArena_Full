import { AiProviderFactory } from './ai-provider.factory';
import { GenerateTextPayload, AnalyzeDocumentPayload, AiStandardResponse } from './interfaces/ai-provider.interface';
export declare class AiService {
    private readonly aiProviderFactory;
    private readonly logger;
    constructor(aiProviderFactory: AiProviderFactory);
    processTextRequest(payload: GenerateTextPayload): Promise<AiStandardResponse>;
    processDocumentRequest(payload: AnalyzeDocumentPayload): Promise<AiStandardResponse>;
}
