import {
  Controller,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';

import { GenerateAiQuestionDto } from '../dto/ai-question-builder.dto';
import {
  AiQuestionBuilderPayload,
  AiDocumentFile,
  AiLectureBuilderPayload,
} from '../interfaces/ai-question-builder.interface';
import { AiQuestionBuilderService } from '../services/ai-question-builder.service';
import {
  aiQuestionMulterOptions,
  AI_QUESTION_UPLOAD_LIMITS,
} from '../constants/ai-question-upload.constant';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserRole } from 'src/common/enums/user-role.enum';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RequireTeacherVerified } from 'src/common/decorators/teacher-verified.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { GenerateFromLectureDto } from '../dto/ai-lecture-builder.dto';

@Controller('questions/ai-builder')
@UseGuards(JwtAuthGuard, RolesGuard)
@RequireTeacherVerified()
export class AiQuestionBuilderController {
  constructor(
    private readonly aiQuestionBuilderService: AiQuestionBuilderService,
  ) {}

  @Post('generate')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @UseInterceptors(
    FilesInterceptor(
      'files',
      AI_QUESTION_UPLOAD_LIMITS.MAX_FILES,
      aiQuestionMulterOptions,
    ),
  )
  async generateQuestionsFromFile(
    @CurrentUser('userId') teacherId: string,
    @Body() dto: GenerateAiQuestionDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException(
        'Bắt buộc phải tải lên ít nhất 1 file đề thi/tài liệu để AI bóc tách.',
      );
    }

    const mappedFiles: AiDocumentFile[] = files.map((file) => ({
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      filePath: file.path,
    }));

    const payload: AiQuestionBuilderPayload = {
      teacherId,
      folderId: dto.folderId,
      files: mappedFiles,
      additionalInstructions: dto.additionalInstructions,
    };
    const result =
      await this.aiQuestionBuilderService.generateQuestionBank(payload);

    return {
      message:
        'AI đang tiến hành phân tích đề thi. Quá trình này có thể mất vài chục giây.',
      data: result,
    };
  }

  @Post('generate-from-lecture')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @UseInterceptors(
    FilesInterceptor('files', AI_QUESTION_UPLOAD_LIMITS.MAX_FILES, aiQuestionMulterOptions)
  )
  async generateQuestionsFromLecture(
    @CurrentUser('userId') teacherId: string,
    @Body() dto: GenerateFromLectureDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Bắt buộc phải tải lên ít nhất 1 file bài giảng để AI phân tích.');
    }

    const mappedFiles: AiDocumentFile[] = files.map((file) => ({
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      filePath: file.path,
    }));

    const payload: AiLectureBuilderPayload = {
      teacherId,
      folderId: dto.folderId,
      files: mappedFiles,
      questionCount: dto.questionCount,
      additionalInstructions: dto.additionalInstructions,
    };

    const result = await this.aiQuestionBuilderService.generateFromLecture(payload);

    return {
      message: `AI đang xử lý bài giảng và tạo ${dto.questionCount} câu hỏi. Vui lòng đợi trong giây lát.`,
      data: result,
    };
  }
}
