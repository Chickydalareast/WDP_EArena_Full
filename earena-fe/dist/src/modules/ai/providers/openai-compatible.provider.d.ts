import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IAiProvider, AiProviderName, AiStandardResponse, GenerateTextPayload } from '../interfaces/ai-provider.interface';
export declare class OpenAiCompatibleProvider implements IAiProvider, OnModuleInit {
    private readonly configService;
    private readonly logger;
    private clients;
    readonly providerName = AiProviderName.GROQ;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    private initializeClients;
    generateTextWithProvider(targetProvider: AiProviderName, payload: Omit<GenerateTextPayload, 'providerName'>): Promise<AiStandardResponse>;
    generateText(payload: Omit<GenerateTextPayload, 'providerName'>): Promise<AiStandardResponse>;
}
