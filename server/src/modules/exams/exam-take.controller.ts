import { Controller, Post, Patch, Param, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ExamTakeService } from './exam-take.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../users/schemas/user.schema';

@Controller('exams/take')
@UseGuards(RolesGuard) 
export class ExamTakeController {
  constructor(private readonly examTakeService: ExamTakeService) {}

  @Post('start')
  @Roles(UserRole.STUDENT) 
  @HttpCode(HttpStatus.OK)
  async startExam(
    @Body('examId') examId: string,
    @Body('examPaperId') examPaperId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.examTakeService.startExam(examId, examPaperId, userId);
  }

  @Patch(':submissionId/auto-save')
  @Roles(UserRole.STUDENT)
  @HttpCode(HttpStatus.OK)
  async autoSave(
    @Param('submissionId') submissionId: string,
    @Body('questionId') questionId: string,
    @Body('selectedAnswerId') selectedAnswerId: string,
  ) {
    return this.examTakeService.autoSaveAnswer(submissionId, questionId, selectedAnswerId);
  }

  @Post(':submissionId/submit')
  @Roles(UserRole.STUDENT)
  @HttpCode(HttpStatus.OK)
  async submitExam(
    @Param('submissionId') submissionId: string,
  ) {
    return this.examTakeService.submitExam(submissionId);
  }
}