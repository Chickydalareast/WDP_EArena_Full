"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const fs = __importStar(require("fs/promises"));
const ai_provider_factory_1 = require("./ai-provider.factory");
const ai_provider_interface_1 = require("./interfaces/ai-provider.interface");
let AiService = AiService_1 = class AiService {
    aiProviderFactory;
    logger = new common_1.Logger(AiService_1.name);
    constructor(aiProviderFactory) {
        this.aiProviderFactory = aiProviderFactory;
    }
    async processTextRequest(payload) {
        const { providerName, ...providerPayload } = payload;
        const provider = this.aiProviderFactory.getProvider(providerName);
        if (providerName === ai_provider_interface_1.AiProviderName.GOOGLE) {
            return provider.generateText(providerPayload);
        }
        else {
            return provider.generateTextWithProvider(providerName, providerPayload);
        }
    }
    async processDocumentRequest(payload) {
        const { providerName, documents, ...providerPayload } = payload;
        const provider = this.aiProviderFactory.getProvider(providerName);
        if (!provider.analyzeDocument) {
            await Promise.all(documents.map(doc => fs.unlink(doc.filePath).catch(() => null)));
            throw new common_1.BadRequestException(`Provider [${providerName}] không hỗ trợ tính năng đọc file trực tiếp.`);
        }
        try {
            return await provider.analyzeDocument({ documents, ...providerPayload });
        }
        finally {
            await Promise.all(documents.map(doc => fs.unlink(doc.filePath).catch(() => null)));
            this.logger.debug(`[Dọn rác Local] Đã tiêu hủy ${documents.length} tệp tạm thuộc luồng AI.`);
        }
    }
};
exports.AiService = AiService;
exports.AiService = AiService = AiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [ai_provider_factory_1.AiProviderFactory])
], AiService);
//# sourceMappingURL=ai.service.js.map