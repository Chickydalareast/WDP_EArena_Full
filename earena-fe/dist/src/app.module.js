"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const bullmq_1 = require("@nestjs/bullmq");
const env_validation_1 = require("./common/configs/env.validation");
const database_module_1 = require("./common/database/database.module");
const redis_module_1 = require("./common/redis/redis.module");
const teacher_verification_module_1 = require("./common/teacher-verification.module");
const users_module_1 = require("./modules/users/users.module");
const auth_module_1 = require("./modules/auth/auth.module");
const jwt_auth_guard_1 = require("./common/guards/jwt-auth.guard");
const rate_limit_guard_1 = require("./common/guards/rate-limit.guard");
const mail_module_1 = require("./modules/mail/mail.module");
const media_module_1 = require("./modules/media/media.module");
const taxonomy_module_1 = require("./modules/taxonomy/taxonomy.module");
const questions_module_1 = require("./modules/questions/questions.module");
const classes_module_1 = require("./modules/classes/classes.module");
const exams_module_1 = require("./modules/exams/exams.module");
const admin_module_1 = require("./modules/admin/admin.module");
const ai_module_1 = require("./modules/ai/ai.module");
const courses_module_1 = require("./modules/courses/courses.module");
const wallets_module_1 = require("./modules/wallets/wallets.module");
const subscriptions_module_1 = require("./modules/subscriptions/subscriptions.module");
const teachers_module_1 = require("./modules/teachers/teachers.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const community_module_1 = require("./modules/community/community.module");
const messaging_module_1 = require("./modules/messaging/messaging.module");
const event_emitter_1 = require("@nestjs/event-emitter");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                validationSchema: env_validation_1.validationSchema,
            }),
            bullmq_1.BullModule.forRootAsync({
                useFactory: async (configService) => ({
                    connection: {
                        host: configService.get('REDIS_HOST'),
                        port: configService.get('REDIS_PORT')
                    },
                }),
                inject: [config_1.ConfigService],
            }),
            database_module_1.DatabaseModule,
            redis_module_1.RedisModule,
            teacher_verification_module_1.TeacherVerificationModule,
            users_module_1.UsersModule,
            auth_module_1.AuthModule,
            mail_module_1.MailModule,
            media_module_1.MediaModule,
            taxonomy_module_1.TaxonomyModule,
            questions_module_1.QuestionsModule,
            classes_module_1.ClassesModule,
            exams_module_1.ExamsModule,
            admin_module_1.AdminModule,
            ai_module_1.AiModule,
            courses_module_1.CoursesModule,
            wallets_module_1.WalletsModule,
            subscriptions_module_1.SubscriptionsModule,
            teachers_module_1.TeachersModule,
            notifications_module_1.NotificationsModule,
            community_module_1.CommunityModule,
            messaging_module_1.MessagingModule,
            event_emitter_1.EventEmitterModule.forRoot(),
        ],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: rate_limit_guard_1.RateLimitGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: jwt_auth_guard_1.JwtAuthGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map