import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';

// --- SCHEMAS ---
import {
  QuestionFolder,
  QuestionFolderSchema,
} from './schemas/question-folder.schema';
import { Question, QuestionSchema } from './schemas/question.schema';

// --- REPOSITORIES ---
import { QuestionFoldersRepository } from './question-folders.repository';
import { QuestionsRepository } from './questions.repository';

// --- SERVICES ---
import { QuestionsService } from './questions.service';
import { QuestionFoldersService } from './question-folders.service';
import { AiQuestionBuilderService } from './services/ai-question-builder.service';

// --- CONTROLLERS ---
import { QuestionFoldersController } from './question-folders.controller';
import { QuestionsController } from './questions.controller';
import { AiQuestionBuilderController } from './controller/ai-question-builder.controller';

// --- ENGINES & PROCESSORS (NEW) ---
import { QuestionOrganizerEngine } from './engines/question-organizer.engine';
import { QuestionTasksProcessor } from './processors/question-tasks.processor';

// --- EXTERNAL MODULES ---
import { UsersModule } from '../users/users.module';
import { TaxonomyModule } from '../taxonomy/taxonomy.module';
import { MediaModule } from '../media/media.module';
import { AiModule } from '../ai/ai.module';

// --- CONSTANTS/INTERFACES ---
import { QUESTION_TASKS_QUEUE } from './interfaces/question-jobs.interface';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: QuestionFolder.name, schema: QuestionFolderSchema },
      { name: Question.name, schema: QuestionSchema },
    ]),
    BullModule.registerQueue({
      name: 'question-sync',
    }),
    BullModule.registerQueue({
      name: QUESTION_TASKS_QUEUE,
    }),
    TaxonomyModule,
    UsersModule,
    MediaModule,
    AiModule,
  ],
  controllers: [
    QuestionsController,
    QuestionFoldersController,
    AiQuestionBuilderController,
  ],
  providers: [
    QuestionFoldersRepository,
    QuestionsRepository,
    QuestionsService,
    QuestionFoldersService,
    AiQuestionBuilderService,
    QuestionOrganizerEngine,
    QuestionTasksProcessor,
  ],
  exports: [
    QuestionFoldersRepository,
    QuestionsRepository,
    QuestionsService,
    QuestionFoldersService,
  ],
})
export class QuestionsModule {}
