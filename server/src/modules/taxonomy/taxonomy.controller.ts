import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import { KnowledgeTopicsService } from './knowledge-topics.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator'; 

@Controller('taxonomy')
export class TaxonomyController {
  constructor(
    private readonly subjectsService: SubjectsService,
    private readonly topicsService: KnowledgeTopicsService,
  ) {}

  @Public() 
  @Get('subjects')
  async getAllSubjects() {
    return this.subjectsService.getAllActiveSubjects();
  }

  @Get('my-subjects')
  async getMySubjects(@CurrentUser('userId') userId: string) {
    return this.subjectsService.getMySubjects(userId);
  }

  @Get('topics/tree/:subjectId')
  async getTopicTree(@Param('subjectId') subjectId: string) {
    return this.topicsService.getTreeBySubject(subjectId);
  }
}