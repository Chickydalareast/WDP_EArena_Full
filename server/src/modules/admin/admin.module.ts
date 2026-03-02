import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { User, UserSchema } from '../users/schemas/user.schema';
import { Exam, ExamSchema } from '../exams/schemas/exam.schema';
import { Question, QuestionSchema } from '../questions/schemas/question.schema';
import { Class, ClassSchema } from '../classes/schemas/class.schema';
import { Subject, SubjectSchema } from '../taxonomy/schemas/subject.schema';
import { KnowledgeTopic, KnowledgeTopicSchema } from '../taxonomy/schemas/knowledge-topic.schema';

import { PricingPlan, PricingPlanSchema } from './schemas/pricing-plan.schema';
import { SubscriptionTransaction, SubscriptionTransactionSchema } from './schemas/subscription-transaction.schema';

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

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Exam.name, schema: ExamSchema },
      { name: Question.name, schema: QuestionSchema },
      { name: Class.name, schema: ClassSchema },
      { name: Subject.name, schema: SubjectSchema },
      { name: KnowledgeTopic.name, schema: KnowledgeTopicSchema },
      { name: PricingPlan.name, schema: PricingPlanSchema },
      { name: SubscriptionTransaction.name, schema: SubscriptionTransactionSchema },
    ]),
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
  ],
  providers: [AdminService, AdminSeederService],
  exports: [AdminService],
})
export class AdminModule {}
