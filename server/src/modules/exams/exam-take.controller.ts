import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ExamTakeService } from './exam-take.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import {
  StartExamDto,
  AutoSaveDto,
  GetStudentHistoryDto,
  GetStudentHistoryOverviewDto,
  GetLessonAttemptsParamDto,
  GetLessonAttemptsQueryDto,
} from './dto/exam-take.dto';
import { UserRole } from 'src/common/enums/user-role.enum';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import {
  GetLessonAttemptsPayload,
  GetStudentHistoryOverviewPayload,
  GetStudentHistoryPayload,
  StartExamPayload,
} from './interfaces/exam-take.interface';

@Controller('exam-take')
@UseGuards(JwtAuthGuard)
export class ExamTakeController {
  constructor(private readonly examTakeService: ExamTakeService) {}

  @Post('start')
  async startExam(
    @CurrentUser('userId') userId: string,
    @Body() dto: StartExamDto,
  ) {
    const payload: StartExamPayload = {
      studentId: userId,
      courseId: dto.courseId,
      lessonId: dto.lessonId,
    };
    return this.examTakeService.startExam(payload);
  }

  @Patch(':submissionId/auto-save')
  @Roles(UserRole.STUDENT)
  @HttpCode(HttpStatus.OK)
  async autoSave(
    @Param('submissionId') submissionId: string,
    @Body() dto: AutoSaveDto,
    @CurrentUser('userId') studentId: string,
  ) {
    return this.examTakeService.autoSaveAnswer({
      submissionId,
      studentId,
      questionId: dto.questionId,
      selectedAnswerId: dto.selectedAnswerId,
    });
  }

  @Post(':submissionId/submit')
  @Roles(UserRole.STUDENT)
  @HttpCode(HttpStatus.OK)
  async submitExam(
    @Param('submissionId') submissionId: string,
    @CurrentUser('userId') studentId: string, // Luôn truyền User vào
  ) {
    return this.examTakeService.submitExam({ submissionId, studentId });
  }

  @Get(':submissionId/result')
  @Roles(UserRole.STUDENT)
  @HttpCode(HttpStatus.OK)
  async getResult(
    @Param('submissionId') submissionId: string,
    @CurrentUser('userId') studentId: string,
  ) {
    return this.examTakeService.getSubmissionResult(submissionId, studentId);
  }

  @Get('history')
  @Roles(UserRole.STUDENT)
  @HttpCode(HttpStatus.OK)
  async getHistory(
    @Query() dto: GetStudentHistoryDto,
    @CurrentUser('userId') studentId: string,
  ) {
    const payload: GetStudentHistoryPayload = {
      studentId,
      page: dto.page,
      limit: dto.limit,
      courseId: dto.courseId,
      lessonId: dto.lessonId,
    };

    return this.examTakeService.getStudentHistory(payload);
  }

  @Get('history/overview')
  @Roles(UserRole.STUDENT)
  @HttpCode(HttpStatus.OK)
  async getHistoryOverview(
    @Query() dto: GetStudentHistoryOverviewDto,
    @CurrentUser('userId') studentId: string,
  ) {
    const payload: GetStudentHistoryOverviewPayload = {
      studentId,
      page: dto.page || 1,
      limit: dto.limit || 10,
      courseId: dto.courseId,
    };

    return this.examTakeService.getStudentHistoryOverview(payload);
  }

  @Get('history/lesson/:lessonId')
  @Roles(UserRole.STUDENT)
  @HttpCode(HttpStatus.OK)
  async getLessonAttempts(
    @Param() params: GetLessonAttemptsParamDto,
    @Query() query: GetLessonAttemptsQueryDto,
    @CurrentUser('userId') studentId: string,
  ) {
    const payload: GetLessonAttemptsPayload = {
      studentId,
      lessonId: params.lessonId,
      page: query.page || 1,
      limit: query.limit || 10,
    };

    return this.examTakeService.getLessonAttempts(payload);
  }
}
