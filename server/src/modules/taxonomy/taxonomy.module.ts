import { Module, forwardRef } from '@nestjs/common'; // <-- Thêm forwardRef
import { MongooseModule } from '@nestjs/mongoose';
import { Subject, SubjectSchema } from './schemas/subject.schema';
import { KnowledgeTopic, KnowledgeTopicSchema } from './schemas/knowledge-topic.schema';
import { SubjectsRepository } from './subjects.repository';
import { KnowledgeTopicsRepository } from './knowledge-topics.repository';
import { TaxonomyController } from './taxonomy.controller';
import { SubjectsService } from './subjects.service';
import { KnowledgeTopicsService } from './knowledge-topics.service';

import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Subject.name, schema: SubjectSchema },
      { name: KnowledgeTopic.name, schema: KnowledgeTopicSchema },
    ]),
    forwardRef(() => UsersModule), 
  ],
  controllers: [TaxonomyController],
  providers: [
    SubjectsRepository,
    KnowledgeTopicsRepository,
    SubjectsService,
    KnowledgeTopicsService
  ],
  exports: [SubjectsRepository, KnowledgeTopicsRepository, SubjectsService,KnowledgeTopicsService,],
})
export class TaxonomyModule {}