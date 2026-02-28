import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { BullModule } from '@nestjs/bull';
import { validationSchema } from './common/configs/env.validation';
import { DatabaseModule } from './common/database/database.module';
import { RedisModule } from './common/redis/redis.module'; 
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard'; 
import { MailModule } from './modules/mail/mail.module';  
import {MediaModule} from './modules/media/media.module'
import { TaxonomyModule } from './modules/taxonomy/taxonomy.module';
import { QuestionsModule } from './modules/questions/questions.module';
import { ClassesModule } from './modules/classes/classes.module';
import { ExamsModule } from './modules/exams/exams.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema,
    }),

    BullModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT')
        },
      }),
      inject: [ConfigService],
    }),
    
    DatabaseModule,
    RedisModule,   
    
    UsersModule,
    AuthModule,
    MailModule,
    MediaModule,
    TaxonomyModule,
    QuestionsModule,
    ClassesModule,
    ExamsModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}