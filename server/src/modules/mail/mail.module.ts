import { Module, Global } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { BullModule } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { MailService } from './mail.service';
import { MailProcessor } from './mail.processor';
import { MailController } from './mail.controller'; // <--- 1. IMPORT NÀY

@Global()
@Module({
  imports: [
    BullModule.registerQueueAsync({
      name: 'mail_queue',
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT')
        },
      }),
      inject: [ConfigService],
    }),
    MailerModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get('MAIL_HOST'),
          port: 587,
          secure: false,
          auth: {
            user: configService.get('MAIL_USER'),
            pass: configService.get('MAIL_PASSWORD'),
          },
        },
        defaults: {
          from: configService.get('MAIL_FROM'),
        },
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [MailController], // <--- 2. KHAI BÁO Ở ĐÂY (BẮT BUỘC)
  providers: [MailService, MailProcessor],
  exports: [MailService],
})
export class MailModule {}