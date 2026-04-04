"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ai_service_1 = require("./ai.service");
const ai_provider_factory_1 = require("./ai-provider.factory");
const google_ai_provider_1 = require("./providers/google-ai.provider");
const openai_compatible_provider_1 = require("./providers/openai-compatible.provider");
const ai_test_controller_1 = require("./ai-test.controller");
let AiModule = class AiModule {
};
exports.AiModule = AiModule;
exports.AiModule = AiModule = __decorate([
    (0, common_1.Module)({
        imports: [config_1.ConfigModule],
        controllers: [ai_test_controller_1.AiTestController],
        providers: [
            google_ai_provider_1.GoogleAiProvider,
            openai_compatible_provider_1.OpenAiCompatibleProvider,
            ai_provider_factory_1.AiProviderFactory,
            ai_service_1.AiService,
        ],
        exports: [ai_service_1.AiService],
    })
], AiModule);
//# sourceMappingURL=ai.module.js.map