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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var OpenAiCompatibleProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAiCompatibleProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const openai_1 = __importDefault(require("openai"));
const ai_provider_interface_1 = require("../interfaces/ai-provider.interface");
let OpenAiCompatibleProvider = OpenAiCompatibleProvider_1 = class OpenAiCompatibleProvider {
    configService;
    logger = new common_1.Logger(OpenAiCompatibleProvider_1.name);
    clients = new Map();
    providerName = ai_provider_interface_1.AiProviderName.GROQ;
    constructor(configService) {
        this.configService = configService;
        this.initializeClients();
    }
    async onModuleInit() {
    }
    initializeClients() {
        const groqKey = this.configService.get('GROQ_API_KEY');
        if (groqKey) {
            this.clients.set(ai_provider_interface_1.AiProviderName.GROQ, new openai_1.default({ baseURL: 'https://api.groq.com/openai/v1', apiKey: groqKey }));
        }
        const githubKey = this.configService.get('GITHUB_TOKEN');
        if (githubKey) {
            this.clients.set(ai_provider_interface_1.AiProviderName.GITHUB, new openai_1.default({ baseURL: 'https://models.inference.ai.azure.com', apiKey: githubKey }));
        }
        const openRouterKey = this.configService.get('OPENROUTER_API_KEY');
        if (openRouterKey) {
            this.clients.set(ai_provider_interface_1.AiProviderName.OPENROUTER, new openai_1.default({ baseURL: 'https://openrouter.ai/api/v1', apiKey: openRouterKey }));
        }
    }
    async generateTextWithProvider(targetProvider, payload) {
        const client = this.clients.get(targetProvider);
        if (!client) {
            throw new common_1.InternalServerErrorException(`AI Provider [${targetProvider}] chưa được cấu hình API Key`);
        }
        this.logger.debug(`[${targetProvider.toUpperCase()}] Đang gọi model: ${payload.modelId}`);
        try {
            const messages = [];
            if (payload.systemPrompt) {
                messages.push({ role: 'system', content: payload.systemPrompt });
            }
            messages.push({ role: 'user', content: payload.userMessage });
            const options = {
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
        }
        catch (error) {
            this.logger.error(`[${targetProvider.toUpperCase()} Error]: ${error.message}`, error.stack);
            throw new common_1.InternalServerErrorException(`Lỗi kết nối đến ${targetProvider} API`);
        }
    }
    async generateText(payload) {
        throw new Error('Method not implemented directly. Use generateTextWithProvider instead.');
    }
};
exports.OpenAiCompatibleProvider = OpenAiCompatibleProvider;
exports.OpenAiCompatibleProvider = OpenAiCompatibleProvider = OpenAiCompatibleProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], OpenAiCompatibleProvider);
//# sourceMappingURL=openai-compatible.provider.js.map