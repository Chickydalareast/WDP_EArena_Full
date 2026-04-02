import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';

import { Exam, ExamSchema } from './schemas/exam.schema';
import { ExamPaper, ExamPaperSchema } from './schemas/exam-paper.schema';
import { ExamMatrix, ExamMatrixSchema } from './schemas/exam-matrix.schema';
import { ExamSubmission, ExamSubmissionSchema } from './schemas/exam-submission.schema';

import { ExamsController } from './exams.controller';
import { ExamsService } from './exams.service';
import { ExamTakeController } from './exam-take.controller';
import { ExamTakeService } from './exam-take.service';
import { ExamGeneratorService } from './exam-generator.service';
import { ExamSubmissionProcessor } from './exam-submission.processor';
import { QuestionSyncProcessor } from './question-sync.processor';

import { ExamsRepository } from './exams.repository';
import { ExamPapersRepository } from './exam-papers.repository';
import { ExamMatricesRepository } from './exam-matrices.repository';
import { ExamSubmissionsRepository } from './exam-submissions.repository';

import { QuestionsModule } from '../questions/questions.module';
import { UsersModule } from '../users/users.module';
import { CoursesModule } from '../courses/courses.module';

import { ExamGradingListener } from './listeners/exam-grading.listener';
import { ExamMatricesController } from './exam-matrices.controller';
import { ExamMatricesService } from './exam-matrices.service';
import { TaxonomyModule } from '../taxonomy/taxonomy.module';
import { QuizLifecycleListener } from './listeners/quiz-lifecycle.listener';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Exam.name, schema: ExamSchema },
      { name: ExamPaper.name, schema: ExamPaperSchema },
      { name: ExamMatrix.name, schema: ExamMatrixSchema },
      { name: ExamSubmission.name, schema: ExamSubmissionSchema },
    ]),
    BullModule.registerQueue({ name: 'exam-grading' }),
    QuestionsModule,
    TaxonomyModule,
    UsersModule,
    forwardRef(() => CoursesModule)
  ],
  controllers: [ExamsController, ExamTakeController, ExamMatricesController],
  providers: [
    ExamsRepository, ExamPapersRepository, ExamMatricesRepository, ExamSubmissionsRepository,
    ExamsService, ExamTakeService, ExamGeneratorService, ExamSubmissionProcessor, QuestionSyncProcessor,

    ExamGradingListener, ExamMatricesService,QuizLifecycleListener,
  ],
  exports: [
    ExamsRepository,
    ExamPapersRepository,
    ExamSubmissionsRepository,
    ExamsService,
    ExamMatricesService,
    ExamGeneratorService,
  ],

})
export class ExamsModule { }