import { AiProviderName, IAiProvider } from './interfaces/ai-provider.interface';
import { GoogleAiProvider } from './providers/google-ai.provider';
import { OpenAiCompatibleProvider } from './providers/openai-compatible.provider';
export declare class AiProviderFactory {
    private readonly googleAiProvider;
    private readonly openAiCompatibleProvider;
    constructor(googleAiProvider: GoogleAiProvider, openAiCompatibleProvider: OpenAiCompatibleProvider);
    getProvider(providerName: AiProviderName): IAiProvider | {
        generateTextWithProvider: any;
    };
}
