import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import { KnowledgeTopicsService } from './knowledge-topics.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('taxonomy')
export class TaxonomyController {
  constructor(
    private readonly subjectsService: SubjectsService,
    private readonly topicsService: KnowledgeTopicsService,
  ) {}

  @Get('my-subjects')
<<<<<<< HEAD
  async getMySubjects(@CurrentUser('id') userId: string) {
=======
  async getMySubjects(@CurrentUser('userId') userId: string) {
>>>>>>> feature/admin-full
    return this.subjectsService.getMySubjects(userId);
  }

  @Get('topics/tree/:subjectId')
  async getTopicTree(@Param('subjectId') subjectId: string) {
    return this.topicsService.getTreeBySubject(subjectId);
  }
}