// file: src/modules/ai/providers/google-ai.provider.ts
import { Injectable, Logger, InternalServerErrorException, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import { IAiProvider, AiProviderName, AiStandardResponse, GenerateTextPayload, AnalyzeDocumentPayload } from '../interfaces/ai-provider.interface';

@Injectable()
export class GoogleAiProvider implements IAiProvider {
  public readonly providerName = AiProviderName.GOOGLE;
  private readonly logger = new Logger(GoogleAiProvider.name);
  private client: GoogleGenAI;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) throw new Error('Thiếu GEMINI_API_KEY trong biến môi trường');
    this.client = new GoogleGenAI({ apiKey });
  }

  async generateText(payload: Omit<GenerateTextPayload, 'providerName'>): Promise<AiStandardResponse> {
    try {
      const response = await this.client.models.generateContent({
        model: payload.modelId,
        contents: payload.userMessage,
        config: {
          systemInstruction: payload.systemPrompt,
          temperature: payload.temperature ?? 0.7,
          responseMimeType: payload.responseFormat === 'json_object' ? 'application/json' : 'text/plain',
        }
      });

      return {
        content: response.text || '',
        modelUsed: payload.modelId,
        provider: this.providerName,
      };
    } catch (error: any) {
      this.logger.error(`[Google GenAI Error]: ${error.message}`, error.stack);
      
      if (error.message?.includes('429') || error.message?.includes('quota') || error?.status === 'RESOURCE_EXHAUSTED') {
        throw new HttpException(
          'Hệ thống AI đang quá tải hoặc hết hạn mức API. Vui lòng thử lại sau ít phút.', 
          HttpStatus.TOO_MANY_REQUESTS
        );
      }
      throw new InternalServerErrorException('Lỗi kết nối đến Google GenAI API');
    }
  }

  async analyzeDocument(payload: Omit<AnalyzeDocumentPayload, 'providerName'>): Promise<AiStandardResponse> {
    this.logger.debug(`[Google GenAI] Đang xử lý ĐỒNG THỜI ${payload.documents.length} file nặng bằng model: ${payload.modelId}`);
    let uploadResults: { uri: string; name: string; mimeType: string }[] = [];

    try {
      // 1. UPLOAD CONCURRENT: Đẩy toàn bộ file lên Google File API cùng một lúc
      const uploadPromises = payload.documents.map(doc => 
        this.client.files.upload({
          file: doc.filePath,
          config: { mimeType: doc.mimeType }
        }).then(res => ({ 
          uri: res.uri as string,   // [CTO FIX]: Ép kiểu để TS không báo lỗi undefined
          name: res.name as string, // [CTO FIX]: Ép kiểu để TS không báo lỗi undefined
          mimeType: doc.mimeType 
        }))
      );
      
      uploadResults = await Promise.all(uploadPromises);
      this.logger.debug(`[Google GenAI] Đã upload thành công ${uploadResults.length} tệp lên Cloud. Bắt đầu Polling...`);

      // 2. POLLING: Chờ Google xử lý xong 100% file
      for (const uploaded of uploadResults) {
        let fileState = await this.client.files.get({ name: uploaded.name });
        let retries = 0;
        const MAX_RETRIES = 30; // Chờ tối đa 60s cho mỗi file

        while (fileState.state === 'PROCESSING' && retries < MAX_RETRIES) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
          fileState = await this.client.files.get({ name: uploaded.name });
          retries++;
        }

        if (fileState.state === 'FAILED') {
          throw new Error(`Google từ chối hoặc phân tích file thất bại (Lý do: File rỗng hoặc mã hóa DRM).`);
        }
        if (fileState.state === 'PROCESSING') {
          throw new Error('Google xử lý file quá lâu (Timeout).');
        }
      }

      // 3. MULTIMODAL PROMPTING: Ghép toàn bộ file vào chung 1 Request
      const parts: any[] = uploadResults.map(f => ({
        fileData: { fileUri: f.uri, mimeType: f.mimeType }
      }));
      parts.push({ text: payload.userMessage }); // Câu lệnh của user chốt sổ

      this.logger.debug(`[Google GenAI] Files ACTIVE. Bắt đầu ép JSON...`);

      const response = await this.client.models.generateContent({
        model: payload.modelId,
        contents: [{ role: 'user', parts: parts }],
        config: {
          systemInstruction: payload.systemPrompt,
          temperature: payload.temperature ?? 0.2,
          responseMimeType: payload.responseFormat === 'json_object' ? 'application/json' : 'text/plain',
        }
      });

      return {
        content: response.text || '',
        modelUsed: payload.modelId,
        provider: this.providerName,
      };

    } catch (error: any) {
      this.logger.error(`[Google GenAI File Error]: ${error.message}`, error.stack);
      
      if (error.message?.includes('429') || error.message?.includes('quota') || error?.status === 'RESOURCE_EXHAUSTED') {
        throw new HttpException('Hệ thống AI đang quá tải hạn mức. Vui lòng thử lại sau.', HttpStatus.TOO_MANY_REQUESTS);
      }
      throw new InternalServerErrorException(error.message || 'Lỗi khi phân tích tài liệu bằng Google GenAI');
    } finally {
      // 4. GARBAGE COLLECTION CLOUD: Xóa toàn bộ file khỏi máy chủ Google
      const deletePromises = uploadResults.map(uploaded => 
        this.client.files.delete({ name: uploaded.name }).catch(() => null)
      );
      await Promise.all(deletePromises);
      this.logger.debug(`[Dọn rác Cloud] Đã tiêu hủy ${uploadResults.length} tệp trên Google Server.`);
    }
  }
}