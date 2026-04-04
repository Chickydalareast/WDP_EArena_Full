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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiProviderFactory = void 0;
const common_1 = require("@nestjs/common");
const ai_provider_interface_1 = require("./interfaces/ai-provider.interface");
const google_ai_provider_1 = require("./providers/google-ai.provider");
const openai_compatible_provider_1 = require("./providers/openai-compatible.provider");
let AiProviderFactory = class AiProviderFactory {
    googleAiProvider;
    openAiCompatibleProvider;
    constructor(googleAiProvider, openAiCompatibleProvider) {
        this.googleAiProvider = googleAiProvider;
        this.openAiCompatibleProvider = openAiCompatibleProvider;
    }
    getProvider(providerName) {
        switch (providerName) {
            case ai_provider_interface_1.AiProviderName.GOOGLE:
                return this.googleAiProvider;
            case ai_provider_interface_1.AiProviderName.GITHUB:
            case ai_provider_interface_1.AiProviderName.GROQ:
            case ai_provider_interface_1.AiProviderName.OPENROUTER:
                return this.openAiCompatibleProvider;
            default:
                throw new common_1.InternalServerErrorException(`Provider ${providerName} không được hỗ trợ`);
        }
    }
};
exports.AiProviderFactory = AiProviderFactory;
exports.AiProviderFactory = AiProviderFactory = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [google_ai_provider_1.GoogleAiProvider,
        openai_compatible_provider_1.OpenAiCompatibleProvider])
], AiProviderFactory);
//# sourceMappingURL=ai-provider.factory.js.map