"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const notification_schema_1 = require("./schemas/notification.schema");
const notifications_repository_1 = require("./repositories/notifications.repository");
const notifications_service_1 = require("./notifications.service");
const notifications_controller_1 = require("./notifications.controller");
const course_notification_listener_1 = require("./listeners/course-notification.listener");
const exam_notification_listener_1 = require("./listeners/exam-notification.listener");
const wallet_notification_listener_1 = require("./listeners/wallet-notification.listener");
const courses_module_1 = require("../courses/courses.module");
const exams_module_1 = require("../exams/exams.module");
const users_module_1 = require("../users/users.module");
const question_notification_listener_1 = require("./listeners/question-notification.listener");
let NotificationsModule = class NotificationsModule {
};
exports.NotificationsModule = NotificationsModule;
exports.NotificationsModule = NotificationsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: notification_schema_1.Notification.name, schema: notification_schema_1.NotificationSchema },
            ]),
            (0, common_1.forwardRef)(() => courses_module_1.CoursesModule),
            (0, common_1.forwardRef)(() => exams_module_1.ExamsModule),
            (0, common_1.forwardRef)(() => users_module_1.UsersModule),
        ],
        controllers: [notifications_controller_1.NotificationsController],
        providers: [
            notifications_repository_1.NotificationsRepository,
            notifications_service_1.NotificationsService,
            course_notification_listener_1.CourseNotificationListener,
            exam_notification_listener_1.ExamNotificationListener,
            wallet_notification_listener_1.WalletNotificationListener,
            question_notification_listener_1.QuestionNotificationListener,
        ],
        exports: [notifications_service_1.NotificationsService],
    })
], NotificationsModule);
//# sourceMappingURL=notifications.module.js.map