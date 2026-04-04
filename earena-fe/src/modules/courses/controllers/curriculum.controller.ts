import {
  Controller,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { CurriculumService } from '../services/curriculum.service';
import {
  CreateSectionDto,
  CreateLessonDto,
  UpdateSectionDto,
  UpdateLessonDto,
} from '../dto/curriculum.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { UserRole } from '../../../common/enums/user-role.enum';
import { ReorderCurriculumDto } from '../dto/course.dto';
import {
  CreateLessonPayload,
  CreateSectionPayload,
  UpdateLessonPayload,
  UpdateSectionPayload,
} from '../interfaces/course.interface';

@Controller('courses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CurriculumController {
  constructor(private readonly curriculumService: CurriculumService) {}

  @Post(':courseId/sections')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  async createSection(
    @Param('courseId') courseId: string,
    @Body() dto: CreateSectionDto,
    @CurrentUser('userId') userId: string,
  ) {
    const payload: CreateSectionPayload = {
      courseId,
      teacherId: userId,
      title: dto.title,
      description: dto.description,
    };
    const data = await this.curriculumService.createSection(payload);
    return { message: 'Khởi tạo Chương thành công', data };
  }

  @Post(':courseId/sections/:sectionId/lessons')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  async createLesson(
    @Param('courseId') courseId: string,
    @Param('sectionId') sectionId: string,
    @Body() dto: CreateLessonDto,
    @CurrentUser('userId') userId: string,
  ) {
    const payload: CreateLessonPayload = {
      courseId,
      sectionId,
      teacherId: userId,
      title: dto.title,
      isFreePreview: dto.isFreePreview ?? false,
      primaryVideoId: dto.primaryVideoId,
      attachments: dto.attachments,
      examId: dto.examId,
      content: dto.content,
      examRules: dto.examRules,
    };
    const data = await this.curriculumService.createLesson(payload);
    return { message: 'Thêm Bài học thành công', data };
  }

  @Delete(':courseId/sections/:sectionId')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  async deleteSection(
    @Param('courseId') courseId: string,
    @Param('sectionId') sectionId: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.curriculumService.deleteSection(courseId, sectionId, userId);
  }

  @Put(':courseId/lessons/:lessonId')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  async updateLesson(
    @Param('courseId') courseId: string,
    @Param('lessonId') lessonId: string,
    @Body() dto: UpdateLessonDto,
    @CurrentUser('userId') userId: string,
  ) {
    const payload: UpdateLessonPayload = {
      courseId,
      lessonId,
      teacherId: userId,
      title: dto.title,
      isFreePreview: dto.isFreePreview,
      primaryVideoId: dto.primaryVideoId,
      attachments: dto.attachments,
      examId: dto.examId,
      content: dto.content,
      examRules: dto.examRules,
    };
    return this.curriculumService.updateLesson(payload);
  }

  @Delete(':courseId/lessons/:lessonId')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  async deleteLesson(
    @Param('courseId') courseId: string,
    @Param('lessonId') lessonId: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.curriculumService.deleteLesson(courseId, lessonId, userId);
  }

  @Patch(':courseId/curriculum/reorder')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  async reorderCurriculum(
    @Param('courseId') courseId: string,
    @Body() dto: ReorderCurriculumDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.curriculumService.reorderCurriculum({
      courseId,
      teacherId: userId,
      sections: dto.sections,
      lessons: dto.lessons,
    });
  }

  @Put(':courseId/sections/:sectionId')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  async updateSection(
    @Param('courseId') courseId: string,
    @Param('sectionId') sectionId: string,
    @Body() dto: UpdateSectionDto,
    @CurrentUser('userId') userId: string,
  ) {
    const payload: UpdateSectionPayload = {
      courseId,
      sectionId,
      teacherId: userId,
      title: dto.title,
      description: dto.description,
    };
    return this.curriculumService.updateSection(payload);
  }
}
