import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../modules/users/schemas/user.schema';
import { TeacherVerificationGuard } from './guards/teacher-verification.guard';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [TeacherVerificationGuard],
  exports: [TeacherVerificationGuard],
})
export class TeacherVerificationModule {}
