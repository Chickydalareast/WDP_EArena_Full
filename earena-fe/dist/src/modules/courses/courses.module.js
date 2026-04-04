"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoursesModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const bullmq_1 = require("@nestjs/bullmq");
const course_schema_1 = require("./schemas/course.schema");
const course_promotion_schema_1 = require("./schemas/course-promotion.schema");
const section_schema_1 = require("./schemas/section.schema");
const lesson_schema_1 = require("./schemas/lesson.schema");
const enrollment_schema_1 = require("./schemas/enrollment.schema");
const course_review_schema_1 = require("./schemas/course-review.schema");
const lesson_progress_schema_1 = require("./schemas/lesson-progress.schema");
const courses_repository_1 = require("./courses.repository");
const sections_repository_1 = require("./repositories/sections.repository");
const lessons_repository_1 = require("./repositories/lessons.repository");
const enrollments_repository_1 = require("./repositories/enrollments.repository");
const course_reviews_repository_1 = require("./repositories/course-reviews.repository");
const lesson_progress_repository_1 = require("./repositories/lesson-progress.repository");
const courses_service_1 = require("./courses.service");
const curriculum_service_1 = require("./services/curriculum.service");
const course_reader_service_1 = require("./services/course-reader.service");
const enrollments_service_1 = require("./services/enrollments.service");
const course_checkout_service_1 = require("./services/course-checkout.service");
const course_reviews_service_1 = require("./services/course-reviews.service");
const ai_course_builder_service_1 = require("./services/ai-course-builder.service");
const course_validator_service_1 = require("./services/course-validator.service");
const course_quiz_builder_service_1 = require("./services/course-quiz-builder.service");
const learning_tracking_service_1 = require("./services/learning-tracking.service");
const heartbeat_sync_processor_1 = require("./processors/heartbeat-sync.processor");
const course_progression_listener_1 = require("./listeners/course-progression.listener");
const courses_controller_1 = require("./courses.controller");
const curriculum_controller_1 = require("./controllers/curriculum.controller");
const course_reader_controller_1 = require("./controllers/course-reader.controller");
const enrollments_controller_1 = require("./controllers/enrollments.controller");
const course_reviews_controller_1 = require("./controllers/course-reviews.controller");
const ai_course_builder_controller_1 = require("./controllers/ai-course-builder.controller");
const course_quiz_builder_controller_1 = require("./controllers/course-quiz-builder.controller");
const learning_tracking_controller_1 = require("./controllers/learning-tracking.controller");
const wallets_module_1 = require("../wallets/wallets.module");
const users_module_1 = require("../users/users.module");
const media_module_1 = require("../media/media.module");
const exams_module_1 = require("../exams/exams.module");
const ai_module_1 = require("../ai/ai.module");
const notifications_module_1 = require("../notifications/notifications.module");
const questions_module_1 = require("../questions/questions.module");
const subscriptions_module_1 = require("../subscriptions/subscriptions.module");
const user_schema_1 = require("../users/schemas/user.schema");
const course_promotion_service_1 = require("./services/course-promotion.service");
let CoursesModule = class CoursesModule {
};
exports.CoursesModule = CoursesModule;
exports.CoursesModule = CoursesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: course_schema_1.Course.name, schema: course_schema_1.CourseSchema },
                { name: section_schema_1.Section.name, schema: section_schema_1.SectionSchema },
                { name: lesson_schema_1.Lesson.name, schema: lesson_schema_1.LessonSchema },
                { name: enrollment_schema_1.Enrollment.name, schema: enrollment_schema_1.EnrollmentSchema },
                { name: course_review_schema_1.CourseReview.name, schema: course_review_schema_1.CourseReviewSchema },
                { name: lesson_progress_schema_1.LessonProgress.name, schema: lesson_progress_schema_1.LessonProgressSchema },
                { name: course_promotion_schema_1.CoursePromotion.name, schema: course_promotion_schema_1.CoursePromotionSchema },
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
            ]),
            subscriptions_module_1.SubscriptionsModule,
            bullmq_1.BullModule.registerQueue({
                name: 'learning-tracking',
            }),
            wallets_module_1.WalletsModule,
            users_module_1.UsersModule,
            media_module_1.MediaModule,
            ai_module_1.AiModule,
            notifications_module_1.NotificationsModule,
            questions_module_1.QuestionsModule,
            (0, common_1.forwardRef)(() => exams_module_1.ExamsModule),
        ],
        controllers: [
            courses_controller_1.CoursesController,
            curriculum_controller_1.CurriculumController,
            course_reader_controller_1.CourseReaderController,
            enrollments_controller_1.EnrollmentsController,
            course_reviews_controller_1.CourseReviewsController,
            ai_course_builder_controller_1.AiCourseBuilderController,
            learning_tracking_controller_1.LearningTrackingController,
            course_quiz_builder_controller_1.CourseQuizBuilderController,
        ],
        providers: [
            courses_repository_1.CoursesRepository,
            sections_repository_1.SectionsRepository,
            lessons_repository_1.LessonsRepository,
            enrollments_repository_1.EnrollmentsRepository,
            course_reviews_repository_1.CourseReviewsRepository,
            lesson_progress_repository_1.LessonProgressRepository,
            courses_service_1.CoursesService,
            curriculum_service_1.CurriculumService,
            course_reader_service_1.CourseReaderService,
            course_promotion_service_1.CoursePromotionService,
            enrollments_service_1.EnrollmentsService,
            course_checkout_service_1.CourseCheckoutService,
            course_reviews_service_1.CourseReviewsService,
            ai_course_builder_service_1.AiCourseBuilderService,
            course_validator_service_1.CourseValidatorService,
            course_quiz_builder_service_1.CourseQuizBuilderService,
            learning_tracking_service_1.LearningTrackingService,
            heartbeat_sync_processor_1.HeartbeatSyncProcessor,
            course_progression_listener_1.CourseProgressionListener,
        ],
        exports: [
            enrollments_service_1.EnrollmentsService,
            courses_service_1.CoursesService,
            courses_repository_1.CoursesRepository,
            lessons_repository_1.LessonsRepository,
            enrollments_repository_1.EnrollmentsRepository,
            lesson_progress_repository_1.LessonProgressRepository,
        ],
    })
], CoursesModule);
//# sourceMappingURL=courses.module.js.map