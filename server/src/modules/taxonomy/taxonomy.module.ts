import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Subject, SubjectSchema } from './schemas/subject.schema';
import { KnowledgeTopic, KnowledgeTopicSchema } from './schemas/knowledge-topic.schema';
import { SubjectsRepository } from './subjects.repository';
import { KnowledgeTopicsRepository } from './knowledge-topics.repository';
<<<<<<< HEAD
=======
import { TaxonomyController } from './taxonomy.controller';
import { SubjectsService } from './subjects.service';
import { KnowledgeTopicsService } from './knowledge-topics.service';
import { UsersModule } from '../users/users.module';
import { RedisModule } from '../../common/redis/redis.module';
>>>>>>> feature/admin-full

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Subject.name, schema: SubjectSchema },
      { name: KnowledgeTopic.name, schema: KnowledgeTopicSchema },
    ]),
<<<<<<< HEAD
  ],
  providers: [SubjectsRepository, KnowledgeTopicsRepository],
  exports: [SubjectsRepository, KnowledgeTopicsRepository],
=======
    UsersModule,
    RedisModule,
  ],
  controllers: [TaxonomyController],
  providers: [
    SubjectsRepository,
    KnowledgeTopicsRepository,
    SubjectsService,
    KnowledgeTopicsService,
  ],
  exports: [
    SubjectsRepository,
    KnowledgeTopicsRepository,
    SubjectsService,
    KnowledgeTopicsService,
  ],
>>>>>>> feature/admin-full
})
export class TaxonomyModule {}