"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const user_schema_1 = require("../users/schemas/user.schema");
const token_schema_1 = require("../auth/schemas/token.schema");
const exam_schema_1 = require("../exams/schemas/exam.schema");
const question_schema_1 = require("../questions/schemas/question.schema");
const class_schema_1 = require("../classes/schemas/class.schema");
const subject_schema_1 = require("../taxonomy/schemas/subject.schema");
const knowledge_topic_schema_1 = require("../taxonomy/schemas/knowledge-topic.schema");
const admin_service_1 = require("./admin.service");
const admin_seeder_1 = require("./admin.seeder");
const admin_dashboard_controller_1 = require("./controllers/admin-dashboard.controller");
const admin_users_controller_1 = require("./controllers/admin-users.controller");
const admin_exams_controller_1 = require("./controllers/admin-exams.controller");
const admin_classes_controller_1 = require("./controllers/admin-classes.controller");
const admin_questions_controller_1 = require("./controllers/admin-questions.controller");
const admin_taxonomy_controller_1 = require("./controllers/admin-taxonomy.controller");
const admin_pricing_controller_1 = require("./controllers/admin-pricing.controller");
const admin_teachers_controller_1 = require("./controllers/admin-teachers.controller");
const admin_business_controller_1 = require("./controllers/admin-business.controller");
const admin_courses_controller_1 = require("./controllers/admin-courses.controller");
const admin_wallets_controller_1 = require("./controllers/admin-wallets.controller");
const courses_module_1 = require("../courses/courses.module");
const admin_courses_service_1 = require("./services/admin-courses.service");
const wallets_module_1 = require("../wallets/wallets.module");
const subscriptions_module_1 = require("../subscriptions/subscriptions.module");
const exams_module_1 = require("../exams/exams.module");
let AdminModule = class AdminModule {
};
exports.AdminModule = AdminModule;
exports.AdminModule = AdminModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
                { name: token_schema_1.Token.name, schema: token_schema_1.TokenSchema },
                { name: exam_schema_1.Exam.name, schema: exam_schema_1.ExamSchema },
                { name: question_schema_1.Question.name, schema: question_schema_1.QuestionSchema },
                { name: class_schema_1.Class.name, schema: class_schema_1.ClassSchema },
                { name: subject_schema_1.Subject.name, schema: subject_schema_1.SubjectSchema },
                { name: knowledge_topic_schema_1.KnowledgeTopic.name, schema: knowledge_topic_schema_1.KnowledgeTopicSchema },
            ]),
            courses_module_1.CoursesModule,
            wallets_module_1.WalletsModule,
            subscriptions_module_1.SubscriptionsModule,
            exams_module_1.ExamsModule
        ],
        controllers: [
            admin_dashboard_controller_1.AdminDashboardController,
            admin_users_controller_1.AdminUsersController,
            admin_exams_controller_1.AdminExamsController,
            admin_classes_controller_1.AdminClassesController,
            admin_questions_controller_1.AdminQuestionsController,
            admin_taxonomy_controller_1.AdminTaxonomyController,
            admin_pricing_controller_1.AdminPricingController,
            admin_teachers_controller_1.AdminTeachersController,
            admin_business_controller_1.AdminBusinessController,
            admin_courses_controller_1.AdminCoursesController,
            admin_wallets_controller_1.AdminWalletsController,
        ],
        providers: [
            admin_service_1.AdminService,
            admin_seeder_1.AdminSeederService,
            admin_courses_service_1.AdminCoursesService,
        ],
        exports: [admin_service_1.AdminService],
    })
], AdminModule);
//# sourceMappingURL=admin.module.js.map