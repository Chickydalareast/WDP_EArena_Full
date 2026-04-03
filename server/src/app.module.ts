import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { BullModule } from '@nestjs/bullmq';
import { validationSchema } from './common/configs/env.validation';
import { DatabaseModule } from './common/database/database.module';
import { RedisModule } from './common/redis/redis.module';
import { TeacherVerificationModule } from './common/teacher-verification.module';

import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RateLimitGuard } from './common/guards/rate-limit.guard';
import { MailModule } from './modules/mail/mail.module';
import { MediaModule } from './modules/media/media.module';
import { TaxonomyModule } from './modules/taxonomy/taxonomy.module';
import { QuestionsModule } from './modules/questions/questions.module';
import { ClassesModule } from './modules/classes/classes.module';
import { ExamsModule } from './modules/exams/exams.module';
import { AdminModule } from './modules/admin/admin.module';
import { AiModule } from './modules/ai/ai.module';
import { CoursesModule } from './modules/courses/courses.module';
import { WalletsModule } from './modules/wallets/wallets.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { TeachersModule } from './modules/teachers/teachers.module';

import { NotificationsModule } from './modules/notifications/notifications.module';

import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema,
    }),

    BullModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT')
        },
      }),
      inject: [ConfigService],
    }),

    DatabaseModule,
    RedisModule,
    TeacherVerificationModule,

    UsersModule,
    AuthModule,
    MailModule,
    MediaModule,
    TaxonomyModule,
    QuestionsModule,
    ClassesModule,
    ExamsModule,
    AdminModule,
    AiModule,
    CoursesModule,
    WalletsModule,
    SubscriptionsModule,
    TeachersModule,
    NotificationsModule,

    EventEmitterModule.forRoot(),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RateLimitGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule { }