import { IsEnum, IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';
import { AiProviderName } from '../interfaces/ai-provider.interface';

export class AnalyzeDocumentDto {
    @IsEnum(AiProviderName, { message: 'Provider không hợp lệ' })
    providerName: AiProviderName;

    @IsString()
    modelId: string;

    @IsString()
    userMessage: string;

    @IsOptional()
    @IsString()
    systemPrompt?: string;

    @IsOptional()
    @Transform(({ value }) => parseFloat(value)) // Vì dữ liệu lên từ form-data luôn là string
    @IsNumber()
    @Min(0)
    @Max(2)
    temperature?: number;

    @IsOptional()
    @IsEnum(['text', 'json_object'])
    responseFormat?: 'text' | 'json_object';
}