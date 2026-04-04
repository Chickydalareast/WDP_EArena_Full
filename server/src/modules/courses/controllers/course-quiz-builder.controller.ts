import {
  Controller,
  Post,
  Body,
  UseGuards,
  Delete,
  Query,
  Put,
  Get,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import {
  CreateCourseQuizDto,
  DeleteCourseQuizDto,
  GetQuizMatricesDto,
  PreviewQuizConfigDto,
  RulePreviewDto,
  UpdateCourseQuizDto,
} from '../dto/course-quiz-builder.dto';
import {
  CreateCourseQuizParams,
  DeleteCourseQuizParams,
  UpdateCourseQuizParams,
  DynamicExamConfigParam,
  GetQuizMatricesParams,
  PreviewQuizConfigParams,
  MatrixSectionParam,
  RulePreviewParams,
  GetQuizHealthParams,
} from '../interfaces/course-quiz-builder.interface';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { UserRole } from '../../../common/enums/user-role.enum';
import { CourseQuizBuilderService } from '../services/course-quiz-builder.service';
import { RuleQuestionType } from 'src/modules/exams/interfaces/exam-matrix.interface';

@Controller('courses/builder/quiz')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CourseQuizBuilderController {
  constructor(
    private readonly courseQuizBuilderService: CourseQuizBuilderService,
  ) {}

  private mapDynamicConfig(
    dtoConfig?: any,
  ): DynamicExamConfigParam | undefined {
    if (!dtoConfig) return undefined;

    return {
      ...(dtoConfig.sourceFolders && {
        sourceFolders: dtoConfig.sourceFolders.map(
          (id: string) => new Types.ObjectId(id),
        ),
      }),
      ...(dtoConfig.mixRatio && { mixRatio: dtoConfig.mixRatio }),
      ...(dtoConfig.matrixId && {
        matrixId: new Types.ObjectId(dtoConfig.matrixId),
      }),
      ...(dtoConfig.adHocSections && {
        adHocSections: dtoConfig.adHocSections.map((sec: any) => ({
          name: sec.name,
          orderIndex: sec.orderIndex ?? 0,
          rules: sec.rules.map((rule: any) => ({
            questionType: rule.questionType,
            subQuestionLimit: rule.questionType === RuleQuestionType.PASSAGE ? rule.subQuestionLimit : undefined,
            folderIds: rule.folderIds,
            topicIds: rule.topicIds,
            difficulties: rule.difficulties,
            tags: rule.tags,
            limit: rule.limit,
          })),
        })),
      }),
    };
  }

  @Post()
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  async createQuizLesson(
    @CurrentUser('userId') teacherId: string,
    @Body() dto: CreateCourseQuizDto,
  ) {
    const params: CreateCourseQuizParams = {
      teacherId,
      courseId: dto.courseId,
      sectionId: dto.sectionId,
      title: dto.title,
      content: dto.content,
      isFreePreview: dto.isFreePreview,
      totalScore: dto.totalScore,
      dynamicConfig: this.mapDynamicConfig(
        dto.dynamicConfig,
      ) as DynamicExamConfigParam,
      examRules: {
        timeLimit: dto.examRules.timeLimit,
        maxAttempts: dto.examRules.maxAttempts,
        passPercentage: dto.examRules.passPercentage,
        showResultMode: dto.examRules.showResultMode,
      },
    };

    const result =
      await this.courseQuizBuilderService.createUnifiedQuizLesson(params);
    return {
      message: 'Tạo Bài học dạng Quiz thành công.',
      data: result,
    };
  }

  @Put()
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  async updateQuizLesson(
    @CurrentUser('userId') teacherId: string,
    @Body() dto: UpdateCourseQuizDto,
  ) {
    const params: UpdateCourseQuizParams = {
      teacherId,
      courseId: dto.courseId,
      lessonId: dto.lessonId,
      title: dto.title,
      content: dto.content,
      isFreePreview: dto.isFreePreview,
      totalScore: dto.totalScore,
      dynamicConfig: this.mapDynamicConfig(dto.dynamicConfig),
      examRules: dto.examRules
        ? {
            timeLimit: dto.examRules.timeLimit,
            maxAttempts: dto.examRules.maxAttempts,
            passPercentage: dto.examRules.passPercentage,
            showResultMode: dto.examRules.showResultMode,
          }
        : undefined,
    };

    const result =
      await this.courseQuizBuilderService.updateUnifiedQuizLesson(params);
    return {
      message: 'Cập nhật Bài học dạng Quiz thành công.',
      data: result,
    };
  }

  @Delete()
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  async deleteQuizLesson(
    @CurrentUser('userId') teacherId: string,
    @Query() dto: DeleteCourseQuizDto,
  ) {
    const params: DeleteCourseQuizParams = {
      teacherId,
      courseId: dto.courseId,
      lessonId: dto.lessonId,
    };

    await this.courseQuizBuilderService.deleteUnifiedQuizLesson(params);
    return {
      message: 'Xóa Bài học Quiz và dọn dẹp dữ liệu thành công.',
    };
  }

  @Get('matrices')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  async getCompatibleMatrices(
    @CurrentUser('userId') teacherId: string,
    @Query() dto: GetQuizMatricesDto,
  ) {
    const params: GetQuizMatricesParams = {
      teacherId,
      courseId: dto.courseId,
      page: dto.page ?? 1,
      limit: dto.limit ?? 10,
      search: dto.search,
    };

    const result =
      await this.courseQuizBuilderService.getMatricesByCourseSubject(params);
    return {
      message: 'Lấy danh sách Khuôn mẫu Ma trận tương thích thành công.',
      data: result,
    };
  }

  @Post('rule-preview')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  async getRuleAvailableCount(
    @CurrentUser('userId') teacherId: string,
    @Body() dto: RulePreviewDto,
  ) {
    const params: RulePreviewParams = {
      teacherId,
      questionType: dto.questionType,
      subQuestionLimit: dto.questionType === RuleQuestionType.PASSAGE ? dto.subQuestionLimit : undefined,
      folderIds: dto.folderIds,
      topicIds: dto.topicIds,
      difficulties: dto.difficulties,
      tags: dto.tags,
      limit: dto.limit,
    };

    const result = await this.courseQuizBuilderService.getAvailableCountForRule(params);
    return {
      message: 'Kiểm tra số lượng câu hỏi khả dụng thành công.',
      data: result,
    };
  }

  @Post('preview')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  async previewQuizConfig(
    @CurrentUser('userId') teacherId: string,
    @Body() dto: PreviewQuizConfigDto,
  ) {
    const params: PreviewQuizConfigParams = {
      teacherId,
      matrixId: dto.matrixId,
      adHocSections: dto.adHocSections?.map((sec) => ({
        name: sec.name,
        orderIndex: sec.orderIndex ?? 0,
        rules: sec.rules.map((rule) => ({
          questionType: rule.questionType,
          subQuestionLimit: rule.questionType === RuleQuestionType.PASSAGE ? rule.subQuestionLimit : undefined,
          folderIds: rule.folderIds,
          topicIds: rule.topicIds,
          difficulties: rule.difficulties,
          tags: rule.tags,
          limit: rule.limit,
        })),
      })) as MatrixSectionParam[] | undefined,
    };

    const result =
      await this.courseQuizBuilderService.previewQuizConfig(params);
    return {
      message: result.message,
      data: {
        totalItems: result.totalItems,
        totalActualQuestions: result.totalActualQuestions,
        previewData: result.previewData,
      },
    };
  }

  @Get(':lessonId/health')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  async getQuizHealth(
    @CurrentUser('userId') teacherId: string,
    @Query('courseId') courseId: string,
    @Param('lessonId') lessonId: string,
  ) {
    if (!courseId) {
      throw new BadRequestException('courseId là bắt buộc.');
    }

    const params: GetQuizHealthParams = { teacherId, courseId, lessonId };
    const result = await this.courseQuizBuilderService.getQuizHealth(params);

    return {
      message: result.isHealthy
        ? 'Quiz đang trong trạng thái hoạt động tốt.'
        : result.configMode === 'unconfigured'
          ? 'Quiz chưa được cấu hình nguồn câu hỏi.'
          : 'Quiz có vấn đề về nguồn câu hỏi, cần kiểm tra ngay.',
      data: result,
    };
  }

  @Get(':lessonId/stats')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  async getQuizAnalytics(
      @CurrentUser('userId') teacherId: string,
      @Query('courseId') courseId: string,
      @Param('lessonId') lessonId: string,
  ) {
      if (!courseId) throw new BadRequestException('courseId là bắt buộc.');
      const result = await this.courseQuizBuilderService.getQuizAnalyticsData(teacherId, courseId, lessonId);
      return {
          message: 'Lấy thống kê phân tích bài thi thành công.',
          data: result,
      };
  }

  @Get(':lessonId/attempts')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  async getTeacherAttemptHistory(
      @CurrentUser('userId') teacherId: string,
      @Query('courseId') courseId: string,
      @Param('lessonId') lessonId: string,
      @Query('page') page?: number,
      @Query('limit') limit?: number,
      @Query('search') search?: string,
  ) {
      if (!courseId) throw new BadRequestException('courseId là bắt buộc.');
      const result = await this.courseQuizBuilderService.getTeacherAttemptHistory(
          teacherId, courseId, lessonId, page || 1, limit || 10, search
      );
      return {
          message: 'Lấy lịch sử làm bài của học viên thành công.',
          data: result.data,
          meta: result.meta,
      };
  }

  @Post(':lessonId/static-questions')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  async assignStaticQuestions(
      @CurrentUser('userId') teacherId: string,
      @Query('courseId') courseId: string,
      @Param('lessonId') lessonId: string,
      @Body('questionIds') questionIds: string[],
  ) {
      if (!courseId) throw new BadRequestException('courseId là bắt buộc.');
      if (!Array.isArray(questionIds) || questionIds.length === 0) {
          throw new BadRequestException('Danh sách questionIds không được để trống.');
      }

      const result = await this.courseQuizBuilderService.assignStaticQuestions(
          teacherId, courseId, lessonId, questionIds
      );
      return {
          message: 'Gán danh sách câu hỏi cố định vào đề thi thành công.',
          data: result,
      };
  }
}