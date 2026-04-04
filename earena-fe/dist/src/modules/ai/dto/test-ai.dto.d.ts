import { AiProviderName } from '../interfaces/ai-provider.interface';
export declare class TestAiDto {
    providerName: AiProviderName;
    modelId: string;
    userMessage: string;
    systemPrompt?: string;
    temperature?: number;
}
