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
Object.defineProperty(exports, "__esModule", { value: true });
exports.validationSchema = void 0;
const Joi = __importStar(require("joi"));
exports.validationSchema = Joi.object({
    NODE_ENV: Joi.string()
        .valid('development', 'production', 'test', 'provision')
        .default('development'),
    PORT: Joi.number().default(3000),
    MONGO_URI: Joi.string().required().description('MongoDB Connection String'),
    JWT_ACCESS_SECRET: Joi.string().required(),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number().default(15),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number().default(7),
    GOOGLE_CLIENT_ID: Joi.string().required().description('Google OAuth Client ID'),
    REDIS_HOST: Joi.string().required(),
    REDIS_PORT: Joi.number().default(6379),
    MAIL_HOST: Joi.string().required(),
    MAIL_USER: Joi.string().required(),
    MAIL_PASSWORD: Joi.string().required(),
    MAIL_FROM: Joi.string().required(),
    GEMINI_API_KEY: Joi.string().allow(null, '').optional().description('Google Gemini API Key'),
    GROQ_API_KEY: Joi.string().allow(null, '').optional().description('Groq API Key'),
    GITHUB_TOKEN: Joi.string().allow(null, '').optional().description('Github Models Token'),
    OPENROUTER_API_KEY: Joi.string().allow(null, '').optional().description('OpenRouter API Key'),
    GROQ_TAGGING_MODEL: Joi.string().default('llama-3.1-8b-instant').description('Model LLM dùng cho Auto-Tagging'),
    COMMUNITY_BANNED_WORDS: Joi.string().allow('', null).optional().description('CSV từ cấm trong Community'),
    COURSE_PROMOTION_COINS_PER_DAY: Joi.number()
        .optional()
        .description('Coin ví / ngày để quảng cáo khóa học trên slider'),
}).unknown(true);
//# sourceMappingURL=env.validation.js.map