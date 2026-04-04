import { Module } from '@nestjs/common';
import { TeachersController } from './teachers.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [TeachersController],
  exports: [],
})
export class TeachersModule {}
