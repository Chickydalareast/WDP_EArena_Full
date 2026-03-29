import {
  Controller,
  Post,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user-role.enum';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

import { GenerateAiCourseDto } from '../dto/ai-builder.dto';
import { AiCourseBuilderPayload, AiDocumentFile } from '../interfaces/ai-builder.interface';
import { AiCourseBuilderService } from '../services/ai-course-builder.service';
import { aiMulterOptions, AI_UPLOAD_LIMITS } from '../constants/ai-upload.constant';

@Controller('courses/:courseId/ai-builder')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AiCourseBuilderController {
  constructor(private readonly aiCourseBuilderService: AiCourseBuilderService) {}

  @Post('generate')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @UseInterceptors(FilesInterceptor('files', AI_UPLOAD_LIMITS.MAX_FILES, aiMulterOptions))
  async generateCourseContent(
    @Param('courseId') courseId: string,
    @CurrentUser('userId') teacherId: string,
    @Body() dto: GenerateAiCourseDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Bắt buộc phải tải lên ít nhất 1 tài liệu để AI phân tích.');
    }

    const mappedFiles: AiDocumentFile[] = files.map((file) => ({
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      filePath: file.path, 
    }));

    const payload: AiCourseBuilderPayload = {
      courseId,
      teacherId,
      files: mappedFiles,
      targetSectionCount: dto.targetSectionCount,
      additionalInstructions: dto.additionalInstructions,
    };

    const result = await this.aiCourseBuilderService.generateCurriculum(payload);

    return {
      message: 'AI đã phân tích và tự động tạo giáo án thành công.',
      data: result,
    };
  }
}