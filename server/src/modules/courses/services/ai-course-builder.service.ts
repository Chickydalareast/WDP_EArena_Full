import {
  Injectable,
  Logger,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as fs from 'fs/promises';
import * as mammoth from 'mammoth'; // [CTO FIX]: Khôi phục mammoth để xử lý riêng luồng DOCX

import {
  AiCourseBuilderPayload,
  AiCurriculumResponse,
  AiGeneratedSection,
  AiDocumentFile,
} from '../interfaces/ai-builder.interface';
import { CoursesRepository } from '../courses.repository';
import { CurriculumService } from './curriculum.service';
import { AiService } from '../../ai/ai.service';
import { AiProviderName } from '../../ai/interfaces/ai-provider.interface';

@Injectable()
export class AiCourseBuilderService {
  private readonly logger = new Logger(AiCourseBuilderService.name);

  constructor(
    private readonly coursesRepo: CoursesRepository,
    private readonly curriculumService: CurriculumService,
    private readonly aiService: AiService,
  ) {}

  async generateCurriculum(payload: AiCourseBuilderPayload) {
    const course = await this.coursesRepo.findByIdSafe(payload.courseId, {
      select: 'teacherId',
    });
    if (!course) throw new NotFoundException('Khóa học không tồn tại.');
    if (course.teacherId.toString() !== payload.teacherId) {
      await this.cleanupTempFiles(payload.files.map((f) => f.filePath));
      throw new ForbiddenException(
        'Bạn không có quyền chỉnh sửa khóa học này.',
      );
    }

    try {
      this.logger.debug(
        `[AI Builder] Bắt đầu phân loại ${payload.files.length} file...`,
      );

      // ==========================================
      // [KIẾN TRÚC LAI]: PHÂN LOẠI TÀI LIỆU
      // ==========================================
      const pdfFiles: AiDocumentFile[] = [];
      let extractedText = '';

      for (const file of payload.files) {
        const mime = file.mimeType.toLowerCase();

        // 1. PDF -> Đẩy vào mảng để Google tự nhai
        if (mime === 'application/pdf') {
          pdfFiles.push(file);
        }
        // 2. DOCX -> Node.js tự bóc chữ siêu tốc bằng Mammoth
        else if (
          mime ===
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ) {
          const result = await mammoth.extractRawText({ path: file.filePath });
          extractedText += `\n\n--- NỘI DUNG TÀI LIỆU (${file.originalName}) ---\n${result.value}\n`;
        }
        // 3. TXT/JSON -> Node.js tự đọc
        else if (mime === 'text/plain' || mime === 'application/json') {
          const text = await fs.readFile(file.filePath, 'utf-8');
          extractedText += `\n\n--- NỘI DUNG TÀI LIỆU (${file.originalName}) ---\n${text}\n`;
        }
      }

      // ==========================================
      // GỌI AI LLM ENGINE
      // ==========================================
      const systemPrompt = this.buildInstructionalDesignerPrompt(
        payload.targetSectionCount,
        payload.additionalInstructions,
      );

      // Gắn phần text bóc được từ DOCX/TXT vào chung với prompt
      const finalUserMessage = `Dưới đây là nội dung văn bản bóc tách từ tài liệu (nếu có):\n${extractedText}\n\nHãy kết hợp chúng với các file PDF đính kèm (nếu có) để tạo cấu trúc khóa học chuẩn.`;

      let aiResponse;

      // TH1: Có file PDF -> Gọi luồng Multi-modal Document API
      if (pdfFiles.length > 0) {
        this.logger.debug(
          `[AI Engine] Kích hoạt luồng File API cho ${pdfFiles.length} file PDF...`,
        );
        aiResponse = await this.aiService.processDocumentRequest({
          providerName: AiProviderName.GOOGLE,
          modelId: 'gemini-2.5-flash',
          documents: pdfFiles.map((f) => ({
            filePath: f.filePath,
            mimeType: f.mimeType,
          })),
          systemPrompt: systemPrompt,
          userMessage: finalUserMessage,
          temperature: 0.2,
          responseFormat: 'json_object',
        });
      }
      // TH2: Chỉ có DOCX/TXT (Mảng pdf rỗng) -> Gọi luồng Text API thuần túy
      else {
        this.logger.debug(
          `[AI Engine] Kích hoạt luồng Text API thuần (Do chỉ có DOCX/TXT)...`,
        );
        aiResponse = await this.aiService.processTextRequest({
          providerName: AiProviderName.GOOGLE,
          modelId: 'gemini-2.5-flash',
          systemPrompt: systemPrompt,
          userMessage: finalUserMessage,
          temperature: 0.2,
          responseFormat: 'json_object',
        });
      }

      // ==========================================
      // LƯU DATABASE
      // ==========================================
      const jsonTree = this.extractJsonFromAiResponse(aiResponse.content);

      if (
        !jsonTree.curriculum ||
        !Array.isArray(jsonTree.curriculum) ||
        jsonTree.curriculum.length === 0
      ) {
        throw new InternalServerErrorException(
          'AI phân tích thành công nhưng không sinh ra được cấu trúc khóa học hợp lệ.',
        );
      }

      this.logger.debug(
        `[AI Builder] Đã bóc xuất được ${jsonTree.curriculum.length} chương. Bắt đầu đẩy vào Database...`,
      );

      await this.coursesRepo.executeInTransaction(async () => {
        await this.injectCurriculumTree(
          payload.courseId,
          payload.teacherId,
          jsonTree.curriculum,
        );
      });

      return {
        status: 'SUCCESS',
        sectionsGenerated: jsonTree.curriculum.length,
        message: 'Khởi tạo cấu trúc khóa học tự động thành công.',
      };
    } catch (error: any) {
      this.logger.error(
        `[AI Course Builder Lỗi]: ${error.message}`,
        error.stack,
      );
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new BadRequestException(
        `Quá trình AI xử lý thất bại: ${error.message}`,
      );
    } finally {
      // Dọn rác an toàn tuyệt đối
      await this.cleanupTempFiles(payload.files.map((f) => f.filePath));
    }
  }

  private async injectCurriculumTree(
    courseId: string,
    teacherId: string,
    curriculum: AiGeneratedSection[],
  ) {
    for (const section of curriculum) {
      const newSection = await this.curriculumService.createSection({
        courseId,
        teacherId,
        title: section.module_title || 'Chương chưa đặt tên',
        description: section.brief_description || '',
      });

      if (section.lessons && Array.isArray(section.lessons)) {
        for (const lesson of section.lessons) {
          await this.curriculumService.createLesson({
            courseId,
            sectionId: newSection.id,
            teacherId,
            title: lesson.lesson_title || 'Bài học chưa đặt tên',
            content:
              lesson.content || '<p>Nội dung bài học đang được cập nhật...</p>',
            isFreePreview: false,
          });
        }
      }
    }
  }

  private extractJsonFromAiResponse(aiText: string): AiCurriculumResponse {
    try {
      const cleanText = aiText
        .replace(/```json/gi, '')
        .replace(/```/gi, '')
        .trim();
      return JSON.parse(cleanText) as AiCurriculumResponse;
    } catch (error) {
      this.logger.error(
        `[JSON Parse Error] AI trả về định dạng rỗng/sai: ${aiText.substring(0, 200)}...`,
      );
      throw new InternalServerErrorException(
        'AI đã tạo phản hồi nhưng không tuân thủ định dạng cấu trúc hệ thống.',
      );
    }
  }

  private buildInstructionalDesignerPrompt(
    targetCount?: number,
    extraInstructions?: string,
  ): string {
    return `
Bạn là một chuyên gia thiết kế chương trình học (Instructional Designer). Nhiệm vụ của bạn là đọc toàn bộ nội dung giáo trình được cung cấp, sau đó phân tách, gộp nhóm và cấu trúc lại thành một khóa học hoàn chỉnh.

⚠️ YÊU CẦU BẮT BUỘC:
1. CHỈ TRẢ VỀ DUY NHẤT một chuỗi JSON hợp lệ. Không được chèn thêm thẻ Markdown (như \`\`\`json).
2. Cấu trúc Root của JSON phải BẮT BUỘC có dạng như sau:
{
  "curriculum": [
    {
      "module_title": "[Tên Chương/Phần]",
      "brief_description": "[Tóm tắt mục tiêu của chương này trong 1-2 câu]",
      "lessons": [
        {
          "lesson_title": "[Tên Bài Học]",
          "content": "[Nội dung chi tiết của bài học. Hãy giữ nguyên các công thức Toán/Lý/Hóa dưới dạng chuỗi thuần. BẮT BUỘC sử dụng thẻ HTML cơ bản (như <p>, <ul>, <li>, <strong>) để văn bản dễ đọc]"
        }
      ]
    }
  ]
}
3. Đảm bảo toàn bộ kiến thức quan trọng trong tài liệu đều được chia vào các "lessons".
${targetCount ? `4. Hãy cố gắng phân loại tài liệu thành khoảng ${targetCount} chương (module).` : ''}
${extraInstructions ? `5. LƯU Ý THÊM TỪ GIÁO VIÊN: ${extraInstructions}` : ''}
    `.trim();
  }

  private async cleanupTempFiles(filePaths: string[]) {
    const unlinkPromises = filePaths.map((path) =>
      fs.unlink(path).catch(() => null),
    );
    await Promise.all(unlinkPromises);
  }
}
