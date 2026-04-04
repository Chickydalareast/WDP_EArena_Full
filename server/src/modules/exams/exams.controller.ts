import {
  Get,
  Controller,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ExamsService } from './exams.service';
import { ExamGeneratorService } from './exam-generator.service';

import {
  InitManualExamDto,
  UpdatePaperQuestionsDto,
  GetExamsDto,
  UpdateExamDto,
  GetLeaderboardDto,
} from './dto';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UserRole } from '../../common/enums/user-role.enum';
import { RequireTeacherVerified } from '../../common/decorators/teacher-verified.decorator';
import { GenerateDynamicExamDto } from './dto/generate-exam.dto';
import {
  FillExistingPaperPayload,
  GenerateDynamicExamPayload,
  PreviewDynamicExamPayload,
  PreviewRulePayload,
} from './interfaces/exam-generator.interface';
import { FillFromMatrixDto } from './dto/fill-from-matrix.dto';
import { UpdatePaperPointsDto } from './dto/update-paper-points.dto';
import { UpdatePaperPointsPayload } from './interfaces/exams.interface';
import { MatrixRuleDto } from './dto/exam-matrix.dto';
import { PreviewDynamicExamDto } from './dto/preview-dynamic-exam.dto';
import { RuleQuestionType } from './interfaces/exam-matrix.interface';

@Controller('exams')
@UseGuards(JwtAuthGuard, RolesGuard)
@RequireTeacherVerified()
export class ExamsController {
  constructor(
    private readonly examsService: ExamsService,
    private readonly examGeneratorService: ExamGeneratorService,
  ) {}

  private mapAdHocSections(sectionsDto?: any[]) {
    if (!sectionsDto) return undefined;
    return sectionsDto.map((sec) => ({
      name: sec.name,
      orderIndex: sec.orderIndex,
      rules: sec.rules.map((r: any) => ({
        questionType: r.questionType ?? RuleQuestionType.MIXED,
        subQuestionLimit:
          r.questionType === RuleQuestionType.PASSAGE
            ? r.subQuestionLimit
            : undefined,
        folderIds: r.folderIds,
        topicIds: r.topicIds,
        difficulties: r.difficulties,
        tags: r.tags,
        limit: r.limit,
      })),
    }));
  }

  @Post('manual/init')
  @Roles(UserRole.TEACHER)
  @HttpCode(HttpStatus.CREATED)
  async initManualExam(
    @Body() dto: InitManualExamDto,
    @CurrentUser('userId') userId: string,
  ) {
    const payload = {
      title: dto.title,
      description: dto.description,
      totalScore: dto.totalScore,
      subjectId: dto.subjectId,
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
  async generateDynamicExam(
    @Body() dto: GenerateDynamicExamDto,
    @CurrentUser('userId') userId: string,
  ) {
    const payload: GenerateDynamicExamPayload = {
      teacherId: userId,
      title: dto.title,
      totalScore: dto.totalScore,
      matrixId: dto.matrixId,
      adHocSections: this.mapAdHocSections(dto.adHocSections),
    };

    return this.examGeneratorService.generateDynamicExam(payload);
  }

  @Post('dynamic/preview')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async previewDynamicExam(
    @CurrentUser('userId') userId: string,
    @Body() dto: PreviewDynamicExamDto,
  ) {
    const payload: PreviewDynamicExamPayload = {
      teacherId: userId,
      matrixId: dto.matrixId,
      adHocSections: this.mapAdHocSections(dto.adHocSections),
    };

    return this.examGeneratorService.previewDynamicExam(payload);
  }

  @Get()
  @Roles(UserRole.TEACHER)
  @HttpCode(HttpStatus.OK)
  async getExams(
    @Query() dto: GetExamsDto,
    @CurrentUser('userId') userId: string,
  ) {
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
      search: dto.search,
    };
    return this.examsService.getLeaderboard(userId, payload);
  }

  @Post(':examId/publish')
  @Roles(UserRole.TEACHER)
  @HttpCode(HttpStatus.OK)
  async publishExam(
    @Param('examId') examId: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.examsService.publishExam(examId, userId);
  }

  @Post('manual/papers/:paperId/fill-from-matrix')
  @Roles(UserRole.TEACHER)
  @HttpCode(HttpStatus.OK)
  async fillExistingPaperFromMatrix(
    @Param('paperId') paperId: string,
    @Body() dto: FillFromMatrixDto,
    @CurrentUser('userId') userId: string,
  ) {
    const payload: FillExistingPaperPayload = {
      teacherId: userId,
      paperId: paperId,
      matrixId: dto.matrixId,
      adHocSections: this.mapAdHocSections(dto.adHocSections),
    };

    return this.examGeneratorService.fillExistingPaperFromMatrix(payload);
  }

  @Patch('manual/papers/:paperId/points')
  @Roles(UserRole.TEACHER)
  @HttpCode(HttpStatus.OK)
  async updatePaperPoints(
    @Param('paperId') paperId: string,
    @Body() dto: UpdatePaperPointsDto,
    @CurrentUser('userId') userId: string,
  ) {
    const payload: UpdatePaperPointsPayload = {
      divideEqually: dto.divideEqually,
      pointsData: dto.pointsData,
    };
    return this.examsService.updatePaperPoints(paperId, userId, payload);
  }

  @Post('manual/papers/:paperId/matrix/preview-rule')
  @Roles(UserRole.TEACHER)
  @HttpCode(HttpStatus.OK)
  async previewMatrixRule(
    @Param('paperId') paperId: string,
    @Body() dto: MatrixRuleDto,
    @CurrentUser('userId') userId: string,
  ) {
    const payload: PreviewRulePayload = {
      teacherId: userId,
      paperId: paperId,
      rule: {
        questionType: dto.questionType ?? RuleQuestionType.MIXED,
        subQuestionLimit:
          dto.questionType === RuleQuestionType.PASSAGE
            ? dto.subQuestionLimit
            : undefined,
        folderIds: dto.folderIds,
        topicIds: dto.topicIds,
        difficulties: dto.difficulties,
        tags: dto.tags,
        limit: dto.limit,
      },
    };

    return this.examGeneratorService.previewRuleAvailability(payload);
  }
}