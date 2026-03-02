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
  JWT_SECRET: Joi.string().required(),
  JWT_ACCESS_EXPIRATION_MINUTES: Joi.number().default(15),
  JWT_REFRESH_EXPIRATION_DAYS: Joi.number().default(7),

  // REDIS
  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().default(6379),
  //REDIS_PASSWORD: Joi.string().allow(null, '').optional(),  

  // MAIL 
  MAIL_HOST: Joi.string().required(),
  MAIL_USER: Joi.string().required(),
  MAIL_PASSWORD: Joi.string().required(),
  MAIL_FROM: Joi.string().required(),
}).unknown(true);