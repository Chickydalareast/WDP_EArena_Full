import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiService } from './ai.service';
import { AiProviderFactory } from './ai-provider.factory';
import { GoogleAiProvider } from './providers/google-ai.provider';
import { OpenAiCompatibleProvider } from './providers/openai-compatible.provider';
import { AiTestController } from './ai-test.controller';

@Module({
  imports: [ConfigModule],
  controllers: [AiTestController],
  providers: [
    GoogleAiProvider,
    OpenAiCompatibleProvider,
    AiProviderFactory,
    AiService,
  ],
  exports: [AiService],
})
export class AiModule {}