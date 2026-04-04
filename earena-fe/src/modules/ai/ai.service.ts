import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import * as fs from 'fs/promises';
import { AiProviderFactory } from './ai-provider.factory';
import { GenerateTextPayload, AnalyzeDocumentPayload, AiStandardResponse, AiProviderName, IAiProvider } from './interfaces/ai-provider.interface';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(private readonly aiProviderFactory: AiProviderFactory) {}

  async processTextRequest(payload: GenerateTextPayload): Promise<AiStandardResponse> {
    const { providerName, ...providerPayload } = payload;
    const provider = this.aiProviderFactory.getProvider(providerName) as IAiProvider;

    if (providerName === AiProviderName.GOOGLE) {
       return provider.generateText(providerPayload);
    } else {
       return (provider as any).generateTextWithProvider(providerName, providerPayload);
    }
  }

  async processDocumentRequest(payload: AnalyzeDocumentPayload): Promise<AiStandardResponse> {
    const { providerName, documents, ...providerPayload } = payload;
    const provider = this.aiProviderFactory.getProvider(providerName) as IAiProvider;

    if (!provider.analyzeDocument) {
      await Promise.all(documents.map(doc => fs.unlink(doc.filePath).catch(() => null)));
      throw new BadRequestException(`Provider [${providerName}] không hỗ trợ tính năng đọc file trực tiếp.`);
    }

    try {
      return await provider.analyzeDocument({ documents, ...providerPayload });
    } finally {
      await Promise.all(documents.map(doc => fs.unlink(doc.filePath).catch(() => null)));
      this.logger.debug(`[Dọn rác Local] Đã tiêu hủy ${documents.length} tệp tạm thuộc luồng AI.`);
    }
  }
}