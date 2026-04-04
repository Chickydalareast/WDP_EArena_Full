import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';

import { Course, CourseSchema } from './schemas/course.schema';
import {
  CoursePromotion,
  CoursePromotionSchema,
} from './schemas/course-promotion.schema';
import { Section, SectionSchema } from './schemas/section.schema';
import { Lesson, LessonSchema } from './schemas/lesson.schema';
import { Enrollment, EnrollmentSchema } from './schemas/enrollment.schema';
import {
  CourseReview,
  CourseReviewSchema,
} from './schemas/course-review.schema';
import {
  LessonProgress,
  LessonProgressSchema,
} from './schemas/lesson-progress.schema';

import { CoursesRepository } from './courses.repository';
import { SectionsRepository } from './repositories/sections.repository';
import { LessonsRepository } from './repositories/lessons.repository';
import { EnrollmentsRepository } from './repositories/enrollments.repository';
import { CourseReviewsRepository } from './repositories/course-reviews.repository';
import { LessonProgressRepository } from './repositories/lesson-progress.repository';

import { CoursesService } from './courses.service';
import { CurriculumService } from './services/curriculum.service';
import { CourseReaderService } from './services/course-reader.service';
import { EnrollmentsService } from './services/enrollments.service';
import { CourseCheckoutService } from './services/course-checkout.service';
import { CourseReviewsService } from './services/course-reviews.service';
import { AiCourseBuilderService } from './services/ai-course-builder.service';
import { CourseValidatorService } from './services/course-validator.service';
import { CourseQuizBuilderService } from './services/course-quiz-builder.service';

import { LearningTrackingService } from './services/learning-tracking.service';
import { HeartbeatSyncProcessor } from './processors/heartbeat-sync.processor';
import { CourseProgressionListener } from './listeners/course-progression.listener';

import { CoursesController } from './courses.controller';
import { CurriculumController } from './controllers/curriculum.controller';
import { CourseReaderController } from './controllers/course-reader.controller';
import { EnrollmentsController } from './controllers/enrollments.controller';
import { CourseReviewsController } from './controllers/course-reviews.controller';
import { AiCourseBuilderController } from './controllers/ai-course-builder.controller';
import { CourseQuizBuilderController } from './controllers/course-quiz-builder.controller';

import { LearningTrackingController } from './controllers/learning-tracking.controller';

import { WalletsModule } from '../wallets/wallets.module';
import { UsersModule } from '../users/users.module';
import { MediaModule } from '../media/media.module';
import { ExamsModule } from '../exams/exams.module';
import { AiModule } from '../ai/ai.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { QuestionsModule } from '../questions/questions.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { User, UserSchema } from '../users/schemas/user.schema';
import { CoursePromotionService } from './services/course-promotion.service';
import { LessonDiscussion, LessonDiscussionSchema } from './schemas/lesson-discussion.schema';
import { LessonDiscussionsController } from './controllers/lesson-discussions.controller';
import { LessonDiscussionsRepository } from './repositories/lesson-discussions.repository';
import { LessonDiscussionsService } from './services/lesson-discussions.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Course.name, schema: CourseSchema },
      { name: Section.name, schema: SectionSchema },
      { name: Lesson.name, schema: LessonSchema },
      { name: Enrollment.name, schema: EnrollmentSchema },
      { name: CourseReview.name, schema: CourseReviewSchema },
      { name: LessonProgress.name, schema: LessonProgressSchema },
      { name: CoursePromotion.name, schema: CoursePromotionSchema },
      { name: User.name, schema: UserSchema },
      { name: LessonDiscussion.name, schema: LessonDiscussionSchema },
    ]),
    SubscriptionsModule,
    BullModule.registerQueue({
      name: 'learning-tracking',
    }),
    WalletsModule,
    UsersModule,
    MediaModule,
    AiModule,
    NotificationsModule,
    QuestionsModule,
    forwardRef(() => ExamsModule),
  ],
  controllers: [
    CoursesController,
    CurriculumController,
    CourseReaderController,
    EnrollmentsController,
    CourseReviewsController,
    AiCourseBuilderController,
    LearningTrackingController,
    CourseQuizBuilderController,
    LessonDiscussionsController,
  ],
  providers: [
    CoursesRepository,
    SectionsRepository,
    LessonsRepository,
    EnrollmentsRepository,
    CourseReviewsRepository,
    LessonProgressRepository,
    LessonDiscussionsRepository,

    CoursesService,
    CurriculumService,
    CourseReaderService,
    CoursePromotionService,
    EnrollmentsService,
    CourseCheckoutService,
    CourseReviewsService,
    AiCourseBuilderService,
    CourseValidatorService,
    CourseQuizBuilderService,
    LearningTrackingService,
    HeartbeatSyncProcessor,
    CourseProgressionListener,
    LessonDiscussionsService,
  ],
  exports: [
    EnrollmentsService,
    CoursesService,
    CoursesRepository,
    LessonsRepository,
    EnrollmentsRepository,
    LessonProgressRepository,
  ],
})
export class CoursesModule {}
