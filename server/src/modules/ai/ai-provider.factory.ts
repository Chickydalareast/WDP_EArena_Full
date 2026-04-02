// file: src/modules/ai/ai-provider.factory.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { AiProviderName, IAiProvider } from './interfaces/ai-provider.interface';
import { GoogleAiProvider } from './providers/google-ai.provider';
import { OpenAiCompatibleProvider } from './providers/openai-compatible.provider';

@Injectable()
export class AiProviderFactory {
  constructor(
    private readonly googleAiProvider: GoogleAiProvider,
    private readonly openAiCompatibleProvider: OpenAiCompatibleProvider,
  ) {}

  // Trả về Adapter xử lý phù hợp dựa trên enum
  getProvider(providerName: AiProviderName): IAiProvider | { generateTextWithProvider: any } {
    switch (providerName) {
      case AiProviderName.GOOGLE:
        return this.googleAiProvider;
      case AiProviderName.GITHUB:
      case AiProviderName.GROQ:
      case AiProviderName.OPENROUTER:
        return this.openAiCompatibleProvider;
      default:
        throw new InternalServerErrorException(`Provider ${providerName} không được hỗ trợ`);
    }
  }
}