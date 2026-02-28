import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QuestionFolder, QuestionFolderSchema } from './schemas/question-folder.schema';
import { Question, QuestionSchema } from './schemas/question.schema';
import { QuestionFoldersRepository } from './question-folders.repository';
import { QuestionsRepository } from './questions.repository';
import { UsersModule } from '../users/users.module';
import { TaxonomyModule } from '../taxonomy/taxonomy.module'
import { QuestionsService } from './questions.service';
import { QuestionFoldersService } from './question-folders.service';
import { QuestionFoldersController } from './question-folders.controller'
import { QuestionsController } from './questions.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: QuestionFolder.name, schema: QuestionFolderSchema },
      { name: Question.name, schema: QuestionSchema },
    ]),
    TaxonomyModule,
    UsersModule,
  ],
  controllers: [QuestionsController, QuestionFoldersController],
  providers: [
    QuestionFoldersRepository, 
    QuestionsRepository, 
    QuestionsService,
    QuestionFoldersService 
  ],
  exports: [
    QuestionFoldersRepository, 
    QuestionsRepository, 
    QuestionsService,
    QuestionFoldersService
  ],
})
export class QuestionsModule {}