import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Subject, SubjectSchema } from './schemas/subject.schema';
import { KnowledgeTopic, KnowledgeTopicSchema } from './schemas/knowledge-topic.schema';
import { SubjectsRepository } from './subjects.repository';
import { KnowledgeTopicsRepository } from './knowledge-topics.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Subject.name, schema: SubjectSchema },
      { name: KnowledgeTopic.name, schema: KnowledgeTopicSchema },
    ]),
  ],
  providers: [SubjectsRepository, KnowledgeTopicsRepository],
  exports: [SubjectsRepository, KnowledgeTopicsRepository],
})
export class TaxonomyModule {}