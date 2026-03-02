import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bull'; 

import { Exam, ExamSchema } from './schemas/exam.schema';
import { ExamPaper, ExamPaperSchema } from './schemas/exam-paper.schema';
import { ExamMatrix, ExamMatrixSchema } from './schemas/exam-matrix.schema';
import { ExamAssignment, ExamAssignmentSchema } from './schemas/exam-assignment.schema';
import { ExamSubmission, ExamSubmissionSchema } from './schemas/exam-submission.schema';

import { ExamsController } from './exams.controller';
import { ExamsService } from './exams.service';
import { ExamTakeController } from './exam-take.controller';
import { ExamTakeService } from './exam-take.service';
import { ExamGeneratorService } from './exam-generator.service';
import { ExamSubmissionProcessor } from './exam-submission.processor';


import { ExamsRepository } from './exams.repository';
import { ExamPapersRepository } from './exam-papers.repository';
import { ExamMatricesRepository } from './exam-matrices.repository';
import { ExamAssignmentsRepository } from './exam-assignments.repository';
import { ExamSubmissionsRepository } from './exam-submissions.repository';

import { QuestionsModule } from '../questions/questions.module';
import { ClassesModule } from '../classes/classes.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Exam.name, schema: ExamSchema },
      { name: ExamPaper.name, schema: ExamPaperSchema },
      { name: ExamMatrix.name, schema: ExamMatrixSchema },
      { name: ExamAssignment.name, schema: ExamAssignmentSchema },
      { name: ExamSubmission.name, schema: ExamSubmissionSchema },
    ]),
    BullModule.registerQueue({
      name: 'exam-grading',
    }),
    QuestionsModule,
    ClassesModule,
  ],
  controllers: [ExamsController, ExamTakeController],
  providers: [
    ExamsRepository,
    ExamPapersRepository,
    ExamMatricesRepository,
    ExamAssignmentsRepository,
    ExamSubmissionsRepository,
    ExamsService,
    ExamTakeService,
    ExamGeneratorService,
    ExamSubmissionProcessor, // KHAI BÁO CẢ WORKER VÀO ĐÂY
  ],
  exports: [
    ExamsRepository,
    ExamPapersRepository,
    ExamAssignmentsRepository,
    ExamSubmissionsRepository,
  ],
})
export class ExamsModule {}