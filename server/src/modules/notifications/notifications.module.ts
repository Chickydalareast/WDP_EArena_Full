import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Notification, NotificationSchema } from './schemas/notification.schema';
import { NotificationsRepository } from './repositories/notifications.repository';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';

import { CourseNotificationListener } from './listeners/course-notification.listener';
import { ExamNotificationListener } from './listeners/exam-notification.listener';
import { WalletNotificationListener } from './listeners/wallet-notification.listener';

import { CoursesModule } from '../courses/courses.module';
import { ExamsModule } from '../exams/exams.module';
import { UsersModule } from '../users/users.module';
import { QuestionNotificationListener } from './listeners/question-notification.listener';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Notification.name, schema: NotificationSchema }]),
        forwardRef(() => CoursesModule),
        forwardRef(() => ExamsModule),
        forwardRef(() => UsersModule), 
    ],
    controllers: [NotificationsController],
    providers: [
        NotificationsRepository,
        NotificationsService,
        CourseNotificationListener,
        ExamNotificationListener,
        WalletNotificationListener,
        QuestionNotificationListener
    ],
    exports: [NotificationsService],
})
export class NotificationsModule { }