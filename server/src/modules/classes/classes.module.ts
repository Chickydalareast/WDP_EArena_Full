import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';
import { ClassesProcessor } from './classes.processor';
import { Class, ClassSchema } from './schemas/class.schema';
import { ClassMember, ClassMemberSchema } from './schemas/class-member.schema';
import { ClassesRepository } from './classes.repository';
import { ClassMembersRepository } from './class-members.repository';
import { ClassesController } from './classes.controller';
import { ClassesService } from './classes.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'classes_queue',
    }),
    MongooseModule.forFeature([
      { name: Class.name, schema: ClassSchema },
      { name: ClassMember.name, schema: ClassMemberSchema },
    ]),
  ],
  controllers: [ClassesController],
  providers: [
    ClassesRepository, 
    ClassMembersRepository, 
    ClassesService,
    ClassesProcessor
  ],
  exports: [
    ClassesRepository, 
    ClassMembersRepository, 
    ClassesService
  ],
})
export class ClassesModule {}