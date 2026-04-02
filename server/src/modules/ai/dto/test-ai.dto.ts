// file: src/modules/ai/dto/test-ai.dto.ts
import { IsEnum, IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { AiProviderName } from '../interfaces/ai-provider.interface';

export class TestAiDto {
  @IsEnum(AiProviderName, { message: 'Provider không hợp lệ (google, github, groq, openrouter)' })
  providerName: AiProviderName;

  @IsString()
  modelId: string; // VD: gemini-2.5-flash, deepseek-r1-distill-llama-70b

  @IsString()
  userMessage: string;

  @IsOptional()
  @IsString()
  systemPrompt?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(2)
  temperature?: number;
}
