export declare enum AiProviderName {
    GOOGLE = "google",
    GITHUB = "github",
    GROQ = "groq",
    OPENROUTER = "openrouter"
}
export interface AiStandardResponse {
    content: string;
    modelUsed: string;
    provider: AiProviderName;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}
export interface GenerateTextPayload {
    providerName: AiProviderName;
    modelId: string;
    userMessage: string;
    systemPrompt?: string;
    temperature?: number;
    responseFormat?: 'text' | 'json_object';
}
export interface AiDocumentInput {
    filePath: string;
    mimeType: string;
}
export interface AnalyzeDocumentPayload {
    providerName: AiProviderName;
    modelId: string;
    documents: AiDocumentInput[];
    userMessage: string;
    systemPrompt?: string;
    temperature?: number;
    responseFormat?: 'text' | 'json_object';
}
export interface IAiProvider {
    readonly providerName: AiProviderName;
    generateText(payload: Omit<GenerateTextPayload, 'providerName'>): Promise<AiStandardResponse>;
    analyzeDocument?(payload: Omit<AnalyzeDocumentPayload, 'providerName'>): Promise<AiStandardResponse>;
}
export declare const AI_PROVIDER_FACTORY = "AI_PROVIDER_FACTORY";
