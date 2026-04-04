import { AiProviderName } from '../interfaces/ai-provider.interface';
export declare class AnalyzeDocumentDto {
    providerName: AiProviderName;
    modelId: string;
    userMessage: string;
    systemPrompt?: string;
    temperature?: number;
    responseFormat?: 'text' | 'json_object';
}
