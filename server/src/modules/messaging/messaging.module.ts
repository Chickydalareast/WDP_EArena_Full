import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatThread, ChatThreadSchema } from './schemas/chat-thread.schema';
import { ChatMessage, ChatMessageSchema } from './schemas/chat-message.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Course, CourseSchema } from '../courses/schemas/course.schema';
import {
  Enrollment,
  EnrollmentSchema,
} from '../courses/schemas/enrollment.schema';
import { MessagingService } from './messaging.service';
import { MessagingController } from './messaging.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    NotificationsModule,
    MongooseModule.forFeature([
      { name: ChatThread.name, schema: ChatThreadSchema },
      { name: ChatMessage.name, schema: ChatMessageSchema },
      { name: User.name, schema: UserSchema },
      { name: Course.name, schema: CourseSchema },
      { name: Enrollment.name, schema: EnrollmentSchema },
    ]),
  ],
  controllers: [MessagingController],
  providers: [MessagingService],
})
export class MessagingModule {}
