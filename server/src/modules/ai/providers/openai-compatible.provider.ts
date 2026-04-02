// file: src/modules/ai/providers/openai-compatible.provider.ts
import { Injectable, Logger, InternalServerErrorException, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai'; // 
import { IAiProvider, AiProviderName, AiStandardResponse, GenerateTextPayload } from '../interfaces/ai-provider.interface';

@Injectable()
export class OpenAiCompatibleProvider implements IAiProvider, OnModuleInit {
    private readonly logger = new Logger(OpenAiCompatibleProvider.name);
    private clients: Map<AiProviderName, OpenAI> = new Map();

    public readonly providerName = AiProviderName.GROQ; // Default, bị override bởi Factory 

    constructor(private readonly configService: ConfigService) {
        this.initializeClients(); // 
    }


    async onModuleInit() {
    }

    private initializeClients() {
        const groqKey = this.configService.get<string>('GROQ_API_KEY');
        if (groqKey) {
            this.clients.set(AiProviderName.GROQ, new OpenAI({ baseURL: 'https://api.groq.com/openai/v1', apiKey: groqKey })); // 
        }

        const githubKey = this.configService.get<string>('GITHUB_TOKEN');
        if (githubKey) {
            this.clients.set(AiProviderName.GITHUB, new OpenAI({ baseURL: 'https://models.inference.ai.azure.com', apiKey: githubKey })); // 
        }

        const openRouterKey = this.configService.get<string>('OPENROUTER_API_KEY');
        if (openRouterKey) {
            this.clients.set(AiProviderName.OPENROUTER, new OpenAI({ baseURL: 'https://openrouter.ai/api/v1', apiKey: openRouterKey })); // 
        }
    }


    async generateTextWithProvider(targetProvider: AiProviderName, payload: Omit<GenerateTextPayload, 'providerName'>): Promise<AiStandardResponse> {
        const client = this.clients.get(targetProvider);
        if (!client) {
            throw new InternalServerErrorException(`AI Provider [${targetProvider}] chưa được cấu hình API Key`);
        }

        this.logger.debug(`[${targetProvider.toUpperCase()}] Đang gọi model: ${payload.modelId}`);

        try {
            const messages: any[] = [];
            if (payload.systemPrompt) {
                messages.push({ role: 'system', content: payload.systemPrompt });
            }
            messages.push({ role: 'user', content: payload.userMessage });

            const options: any = {
                model: payload.modelId,
                messages: messages,
                temperature: payload.temperature ?? 0.2,
            };

            if (payload.responseFormat === 'json_object') {
                options.response_format = { type: 'json_object' };
            }

            const response = await client.chat.completions.create(options);

            this.logger.log(`[${targetProvider.toUpperCase()}] Call thành công. Model used: ${payload.modelId}`);

            return {
                content: response.choices[0]?.message?.content || '', 
                modelUsed: payload.modelId,
                provider: targetProvider,
                usage: response.usage ? {
                    promptTokens: response.usage.prompt_tokens,
                    completionTokens: response.usage.completion_tokens,
                    totalTokens: response.usage.total_tokens,
                } : undefined
            };
        } catch (error: any) {
            this.logger.error(`[${targetProvider.toUpperCase()} Error]: ${error.message}`, error.stack);
            throw new InternalServerErrorException(`Lỗi kết nối đến ${targetProvider} API`);
        }
    }

    async generateText(payload: Omit<GenerateTextPayload, 'providerName'>): Promise<AiStandardResponse> {
        throw new Error('Method not implemented directly. Use generateTextWithProvider instead.'); // 
    }
}