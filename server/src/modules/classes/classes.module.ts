import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Class, ClassSchema } from './schemas/class.schema';
import { ClassMember, ClassMemberSchema } from './schemas/class-member.schema';
import { ClassesRepository } from './classes.repository';
import { ClassMembersRepository } from './class-members.repository';
import { ClassesController } from './classes.controller';
import { ClassesService } from './classes.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Class.name, schema: ClassSchema },
      { name: ClassMember.name, schema: ClassMemberSchema },
    ]),
  ],
  controllers: [ClassesController],
  providers: [
    ClassesRepository, 
    ClassMembersRepository, 
    ClassesService
  ],
  exports: [
    ClassesRepository, 
    ClassMembersRepository, 
    ClassesService
  ],
})
export class ClassesModule {}