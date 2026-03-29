import { Get, Controller, Post, Patch, Delete, Param, Body, UseGuards, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ExamsService } from './exams.service';
import { ExamGeneratorService } from './exam-generator.service';

import {
  InitManualExamDto,
  UpdatePaperQuestionsDto,
  GenerateMatrixDto,
  GetExamsDto,
  UpdateExamDto,
  GetLeaderboardDto
} from './dto';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UserRole } from 'src/common/enums/user-role.enum';

@Controller('exams')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExamsController {
  constructor(
    private readonly examsService: ExamsService,
    private readonly examGeneratorService: ExamGeneratorService,
  ) { }

  @Post('manual/init')
  @Roles(UserRole.TEACHER)
  @HttpCode(HttpStatus.CREATED)
  async initManualExam(
    @Body() dto: InitManualExamDto,
    @CurrentUser('userId') userId: string,
  ) {
    // [MAX PING]: Chặn DTO, Đóng gói Payload theo chuẩn Domain
    const payload = {
      title: dto.title,
      description: dto.description,
      totalScore: dto.totalScore,
    };
    return this.examsService.initManualExam(userId, payload);
  }

  @Patch('manual/papers/:paperId/questions')
  @Roles(UserRole.TEACHER)
  @HttpCode(HttpStatus.OK)
  async updatePaperQuestions(
    @Param('paperId') paperId: string,
    @Body() dto: UpdatePaperQuestionsDto,
    @CurrentUser('userId') userId: string,
  ) {
    // [MAX PING]: Chặn DTO, Đóng gói Payload
    const payload = {
      action: dto.action,
      questionId: dto.questionId,
      questionIds: dto.questionIds,
    };
    return this.examsService.updatePaperQuestions(paperId, userId, payload);
  }

  @Post('generate')
  @Roles(UserRole.TEACHER)
  @HttpCode(HttpStatus.CREATED)
  async generateFromMatrix(
    @Body() dto: GenerateMatrixDto,
    @CurrentUser('userId') userId: string,
  ) {
    const payload = {
      teacherId: userId,
      title: dto.title,
      totalScore: dto.totalScore,
      criteria: dto.criteria,
    };
    return this.examGeneratorService.generateFromMatrix(payload);
  }

  @Get()
  @Roles(UserRole.TEACHER)
  @HttpCode(HttpStatus.OK)
  async getExams(
    @Query() dto: GetExamsDto,
    @CurrentUser('userId') userId: string,
  ) {
    // [MAX PING]: Unpack DTO ra Domain Object
    const payload = {
      page: dto.page,
      limit: dto.limit,
      search: dto.search,
      type: dto.type,
      subjectId: dto.subjectId,
    };
    return this.examsService.getExams(userId, payload);
  }

  @Get('manual/papers/:paperId')
  @Roles(UserRole.TEACHER)
  @HttpCode(HttpStatus.OK)
  async getPaperDetail(
    @Param('paperId') paperId: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.examsService.getPaperDetail(paperId, userId);
  }

  @Patch(':examId')
  @Roles(UserRole.TEACHER)
  @HttpCode(HttpStatus.OK)
  async updateExam(
    @Param('examId') examId: string,
    @Body() dto: UpdateExamDto,
    @CurrentUser('userId') userId: string,
  ) {
    // [MAX PING]: Tránh leak DTO thẳng vào Service
    const payload = {
      title: dto.title,
      description: dto.description,
      totalScore: dto.totalScore,
    };
    return this.examsService.updateExam(examId, userId, payload);
  }

  @Delete(':examId')
  @Roles(UserRole.TEACHER)
  @HttpCode(HttpStatus.OK)
  async deleteExam(
    @Param('examId') examId: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.examsService.deleteExam(examId, userId);
  }

  @Get('leaderboard/courses/:courseId/lessons/:lessonId')
  @Roles(UserRole.TEACHER)
  @HttpCode(HttpStatus.OK)
  async getLeaderboard(
    @Param('courseId') courseId: string,
    @Param('lessonId') lessonId: string,
    @Query() dto: GetLeaderboardDto,
    @CurrentUser('userId') userId: string,
  ) {
    const payload = {
      courseId,
      lessonId,
      page: dto.page,
      limit: dto.limit,
      search: dto.search
    };
    return this.examsService.getLeaderboard(userId, payload);
  }

  @Post(':examId/publish')
  @Roles(UserRole.TEACHER)
  @HttpCode(HttpStatus.OK)
  async publishExam(
    @Param('examId') examId: string,
    @CurrentUser('userId') userId: string
  ) {
    return this.examsService.publishExam(examId, userId);
  }
}