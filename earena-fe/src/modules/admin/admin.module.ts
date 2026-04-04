import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { User, UserSchema } from '../users/schemas/user.schema';
import { Token, TokenSchema } from '../auth/schemas/token.schema';
import { Exam, ExamSchema } from '../exams/schemas/exam.schema';
import { Question, QuestionSchema } from '../questions/schemas/question.schema';
import { Class, ClassSchema } from '../classes/schemas/class.schema';
import { Subject, SubjectSchema } from '../taxonomy/schemas/subject.schema';
import { KnowledgeTopic, KnowledgeTopicSchema } from '../taxonomy/schemas/knowledge-topic.schema';

import { AdminService } from './admin.service';
import { AdminSeederService } from './admin.seeder';

import { AdminDashboardController } from './controllers/admin-dashboard.controller';
import { AdminUsersController } from './controllers/admin-users.controller';
import { AdminExamsController } from './controllers/admin-exams.controller';
import { AdminClassesController } from './controllers/admin-classes.controller';
import { AdminQuestionsController } from './controllers/admin-questions.controller';
import { AdminTaxonomyController } from './controllers/admin-taxonomy.controller';
import { AdminPricingController } from './controllers/admin-pricing.controller';
import { AdminTeachersController } from './controllers/admin-teachers.controller';
import { AdminBusinessController } from './controllers/admin-business.controller';
import { AdminCoursesController } from './controllers/admin-courses.controller';
import { AdminWalletsController } from './controllers/admin-wallets.controller'; 

import { CoursesModule } from '../courses/courses.module';
import { AdminCoursesService } from './services/admin-courses.service';
import { WalletsModule } from '../wallets/wallets.module'; 

import { SubscriptionsModule } from '../subscriptions/subscriptions.module'; 
import { ExamsModule } from '../exams/exams.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Token.name, schema: TokenSchema },
      { name: Exam.name, schema: ExamSchema },
      { name: Question.name, schema: QuestionSchema },
      { name: Class.name, schema: ClassSchema },
      { name: Subject.name, schema: SubjectSchema },
      { name: KnowledgeTopic.name, schema: KnowledgeTopicSchema },
    ]),
    CoursesModule,
    WalletsModule,
    SubscriptionsModule,
    ExamsModule
  ],
  controllers: [
    AdminDashboardController,
    AdminUsersController,
    AdminExamsController,
    AdminClassesController,
    AdminQuestionsController,
    AdminTaxonomyController,
    AdminPricingController,
    AdminTeachersController,
    AdminBusinessController,
    AdminCoursesController,
    AdminWalletsController,
  ],
  providers: [
    AdminService,
    AdminSeederService,
    AdminCoursesService,
  ],
  exports: [AdminService],
})
export class AdminModule { }