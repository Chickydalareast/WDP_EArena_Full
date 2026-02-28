import { Controller, Post, Patch, Param, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ExamsService } from './exams.service';
import { ExamGeneratorService } from './exam-generator.service';

import { 
  InitManualExamDto, 
  UpdatePaperQuestionsDto, 
  CreateExamAssignmentDto, 
  GenerateMatrixDto 
} from './dto';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../users/schemas/user.schema'; 

@Controller('exams')
@UseGuards(RolesGuard) 
export class ExamsController {
  constructor(
    private readonly examsService: ExamsService,
    private readonly examGeneratorService: ExamGeneratorService, 
  ) {}

  @Post('manual/init')
  @Roles(UserRole.TEACHER) 
  @HttpCode(HttpStatus.CREATED)
  async initManualExam(
    @Body() dto: InitManualExamDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.examsService.initManualExam(userId, dto);
  }

  @Patch('manual/papers/:paperId/questions')
  @Roles(UserRole.TEACHER) 
  @HttpCode(HttpStatus.OK)
  async updatePaperQuestions(
    @Param('paperId') paperId: string,
    @Body() dto: UpdatePaperQuestionsDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.examsService.updatePaperQuestions(paperId, userId, dto.action, dto.questionId);
  }

  @Post('assignments')
  @Roles(UserRole.TEACHER) 
  @HttpCode(HttpStatus.CREATED)
  async assignExamToClass(
    @Body() dto: CreateExamAssignmentDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.examsService.assignExamToClass(userId, dto);
  }

  @Post('generate')
  @Roles(UserRole.TEACHER) 
  @HttpCode(HttpStatus.CREATED)
  async generateFromMatrix(
    @Body() dto: GenerateMatrixDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.examGeneratorService.generateFromMatrix({
      teacherId: userId,
      title: dto.title,
      duration: dto.duration,
      totalScore: dto.totalScore,
      criteria: dto.criteria,
    });
  }
}