import * as Joi from 'joi';

export const validationSchema = Joi.object({
  // 1. App Basic
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'provision')
    .default('development'),
  PORT: Joi.number().default(3000),

  // 2. Database
  MONGO_URI: Joi.string().required().description('MongoDB Connection String'),

  // 3. JWT Auth
  JWT_ACCESS_SECRET: Joi.string().required(),
  JWT_ACCESS_EXPIRATION_MINUTES: Joi.number().default(15),
  JWT_REFRESH_EXPIRATION_DAYS: Joi.number().default(7),

  // 4. Google Auth
  GOOGLE_CLIENT_ID: Joi.string().required().description('Google OAuth Client ID'),

  // 5. REDIS
  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().default(6379),

  // 6. MAIL 
  MAIL_HOST: Joi.string().required(),
  MAIL_USER: Joi.string().required(),
  MAIL_PASSWORD: Joi.string().required(),
  MAIL_FROM: Joi.string().required(),

  // =========================================================
  // 7. AI & LLM PROVIDERS (CTO ADDED)
  // =========================================================
  GEMINI_API_KEY: Joi.string().allow(null, '').optional().description('Google Gemini API Key'),
  GROQ_API_KEY: Joi.string().allow(null, '').optional().description('Groq API Key'),
  GITHUB_TOKEN: Joi.string().allow(null, '').optional().description('Github Models Token'),
  OPENROUTER_API_KEY: Joi.string().allow(null, '').optional().description('OpenRouter API Key'),
  
  // Ràng buộc cấu hình Model cho luồng Auto-Tag (Sẽ mặc định dùng llama-3.1 nếu không set)
  GROQ_TAGGING_MODEL: Joi.string().default('llama-3.1-8b-instant').description('Model LLM dùng cho Auto-Tagging'),

  COMMUNITY_BANNED_WORDS: Joi.string().allow('', null).optional().description('CSV từ cấm trong Community'),

  COURSE_PROMOTION_COINS_PER_DAY: Joi.number()
    .optional()
    .description('Coin ví / ngày để quảng cáo khóa học trên slider'),
}).unknown(true);