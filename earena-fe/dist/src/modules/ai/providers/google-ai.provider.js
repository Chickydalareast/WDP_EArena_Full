"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var GoogleAiProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleAiProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const genai_1 = require("@google/genai");
const ai_provider_interface_1 = require("../interfaces/ai-provider.interface");
let GoogleAiProvider = GoogleAiProvider_1 = class GoogleAiProvider {
    configService;
    providerName = ai_provider_interface_1.AiProviderName.GOOGLE;
    logger = new common_1.Logger(GoogleAiProvider_1.name);
    client;
    constructor(configService) {
        this.configService = configService;
        const apiKey = this.configService.get('GEMINI_API_KEY');
        if (!apiKey)
            throw new Error('Thiếu GEMINI_API_KEY trong biến môi trường');
        this.client = new genai_1.GoogleGenAI({ apiKey });
    }
    async generateText(payload) {
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
        }
        catch (error) {
            this.logger.error(`[Google GenAI Error]: ${error.message}`, error.stack);
            if (error.message?.includes('429') || error.message?.includes('quota') || error?.status === 'RESOURCE_EXHAUSTED') {
                throw new common_1.HttpException('Hệ thống AI đang quá tải hoặc hết hạn mức API. Vui lòng thử lại sau ít phút.', common_1.HttpStatus.TOO_MANY_REQUESTS);
            }
            throw new common_1.InternalServerErrorException('Lỗi kết nối đến Google GenAI API');
        }
    }
    async analyzeDocument(payload) {
        this.logger.debug(`[Google GenAI] Đang xử lý ĐỒNG THỜI ${payload.documents.length} file nặng bằng model: ${payload.modelId}`);
        let uploadResults = [];
        try {
            const uploadPromises = payload.documents.map(doc => this.client.files.upload({
                file: doc.filePath,
                config: { mimeType: doc.mimeType }
            }).then(res => ({
                uri: res.uri,
                name: res.name,
                mimeType: doc.mimeType
            })));
            uploadResults = await Promise.all(uploadPromises);
            this.logger.debug(`[Google GenAI] Đã upload thành công ${uploadResults.length} tệp lên Cloud. Bắt đầu Polling...`);
            for (const uploaded of uploadResults) {
                let fileState = await this.client.files.get({ name: uploaded.name });
                let retries = 0;
                const MAX_RETRIES = 30;
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
            const parts = uploadResults.map(f => ({
                fileData: { fileUri: f.uri, mimeType: f.mimeType }
            }));
            parts.push({ text: payload.userMessage });
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
        }
        catch (error) {
            this.logger.error(`[Google GenAI File Error]: ${error.message}`, error.stack);
            if (error.message?.includes('429') || error.message?.includes('quota') || error?.status === 'RESOURCE_EXHAUSTED') {
                throw new common_1.HttpException('Hệ thống AI đang quá tải hạn mức. Vui lòng thử lại sau.', common_1.HttpStatus.TOO_MANY_REQUESTS);
            }
            throw new common_1.InternalServerErrorException(error.message || 'Lỗi khi phân tích tài liệu bằng Google GenAI');
        }
        finally {
            const deletePromises = uploadResults.map(uploaded => this.client.files.delete({ name: uploaded.name }).catch(() => null));
            await Promise.all(deletePromises);
            this.logger.debug(`[Dọn rác Cloud] Đã tiêu hủy ${uploadResults.length} tệp trên Google Server.`);
        }
    }
};
exports.GoogleAiProvider = GoogleAiProvider;
exports.GoogleAiProvider = GoogleAiProvider = GoogleAiProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], GoogleAiProvider);
//# sourceMappingURL=google-ai.provider.js.map