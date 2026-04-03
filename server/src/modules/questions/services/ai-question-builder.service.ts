import {
  Injectable,
  Logger,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import * as fs from 'fs/promises';
import * as mammoth from 'mammoth';

import {
  AiQuestionBuilderPayload,
  AiQuestionBankResponse,
} from '../interfaces/ai-question-builder.interface';
import { QuestionFoldersRepository } from '../question-folders.repository';
import { UsersService } from '../../users/users.service';
import { AiService } from '../../ai/ai.service';
import { AiProviderName } from '../../ai/interfaces/ai-provider.interface';
import { KnowledgeTopicsService } from '../../taxonomy/knowledge-topics.service';
import { QuestionsService } from '../questions.service';

@Injectable()
export class AiQuestionBuilderService {
  private readonly logger = new Logger(AiQuestionBuilderService.name);

  constructor(
    private readonly foldersRepo: QuestionFoldersRepository,
    private readonly usersService: UsersService,
    private readonly aiService: AiService,
    private readonly topicsService: KnowledgeTopicsService,
    private readonly questionsService: QuestionsService,
  ) {}

  async generateQuestionBank(payload: AiQuestionBuilderPayload) {
    try {
      this.logger.debug(
        `[AI Builder] Bắt đầu phân tích đề thi cho User ${payload.teacherId}`,
      );

      // 1. Validate Folder
      const folder = await this.foldersRepo.findByIdSafe(
        new Types.ObjectId(payload.folderId),
      );
      if (!folder || folder.ownerId.toString() !== payload.teacherId) {
        throw new ForbiddenException(
          'Thư mục đích không tồn tại hoặc bạn không có quyền thao tác.',
        );
      }

      // 2. [CTO SECURE FLOW] Truy xuất cứng Môn học từ Database theo Teacher ID
      const teacher = await this.usersService.findById(payload.teacherId);
      if (!teacher || !teacher.subjectIds || teacher.subjectIds.length === 0) {
        throw new BadRequestException(
          'Tài khoản của bạn chưa được phân công giảng dạy bộ môn nào. Vui lòng liên hệ Admin.',
        );
      }

      // [CTO FIX]: Xử lý an toàn trường hợp subjectIds đã bị UsersService populate thành Object
      const firstSubject: any = teacher.subjectIds[0];
      const targetSubjectId = firstSubject._id
        ? firstSubject._id.toString()
        : firstSubject.toString();

      // [BỌC THÉP]: Chặn đứng mọi rác dữ liệu trước khi gọi xuống Taxonomy
      if (!Types.ObjectId.isValid(targetSubjectId)) {
        throw new InternalServerErrorException(
          `Lỗi dữ liệu hệ thống: Mã môn học của giáo viên không hợp lệ (${targetSubjectId}).`,
        );
      }

      // 3. [CONTEXT INJECTION] Lấy cây Chuyên đề (Knowledge Topics)
      const rawTopicTree =
        await this.topicsService.getTreeBySubject(targetSubjectId);
      const flatTopicsDict = this.flattenTopicTree(rawTopicTree);
      // 4. [HYBRID EXTRACTION] Bóc tách tài liệu
      const pdfFiles: any[] = [];
      let extractedText = '';

      for (const file of payload.files) {
        const mime = file.mimeType.toLowerCase();
        if (mime === 'application/pdf') {
          pdfFiles.push(file);
        } else if (
          mime ===
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ) {
          const result = await mammoth.extractRawText({ path: file.filePath });
          extractedText += `\n\n--- ĐỀ THI (${file.originalName}) ---\n${result.value}\n`;
        } else if (mime === 'text/plain' || mime === 'application/json') {
          extractedText += `\n\n--- ĐỀ THI (${file.originalName}) ---\n${await fs.readFile(file.filePath, 'utf-8')}\n`;
        }
      }

      // 5. [MEGA-PROMPTING] Xây dựng lời gọi LLM
      const systemPrompt = this.buildExamSetterPrompt(
        flatTopicsDict,
        payload.additionalInstructions,
      );
      const finalUserMessage = `Dưới đây là văn bản bóc tách từ đề thi (nếu có):\n${extractedText}\n\nHãy kết hợp với file PDF đính kèm (nếu có) để tạo bộ câu hỏi JSON.`;

      let aiResponse;
      if (pdfFiles.length > 0) {
        this.logger.debug(
          `[AI Engine] Đang gọi Google Gemini Flash (Multimodal) cho ${pdfFiles.length} file PDF...`,
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
          temperature: 0.1, // Nhiệt độ cực thấp để đảm bảo tính logic của đáp án
          responseFormat: 'json_object',
        });
      } else {
        this.logger.debug(
          `[AI Engine] Đang gọi Google Gemini Flash (Text Only) cho file DOCX...`,
        );
        aiResponse = await this.aiService.processTextRequest({
          providerName: AiProviderName.GOOGLE,
          modelId: 'gemini-2.5-flash',
          systemPrompt: systemPrompt,
          userMessage: finalUserMessage,
          temperature: 0.1,
          responseFormat: 'json_object',
        });
      }

      // 6. Parse JSON & Bắn vào Database
      const jsonBank = this.extractJsonFromAiResponse(aiResponse.content);

      if (
        !jsonBank.questions ||
        !Array.isArray(jsonBank.questions) ||
        jsonBank.questions.length === 0
      ) {
        throw new InternalServerErrorException(
          'AI đã chạy nhưng không bóc tách được câu hỏi nào.',
        );
      }

      this.logger.debug(
        `[AI Builder] Bóc thành công ${jsonBank.questions.length} câu. Bắt đầu lưu DB...`,
      );

      // Tái sử dụng hàm xịn xò của QuestionsService (Đã bao gồm Transaction)
      // [CTO FIX]: Chỉ truyền đúng 1 Object Payload theo Interface
      await this.questionsService.bulkCreateQuestions({
        ownerId: payload.teacherId,
        folderId: payload.folderId,
        questions: jsonBank.questions as any,
      });

      return {
        status: 'SUCCESS',
        questionsGenerated: jsonBank.questions.length,
        message: 'Đã bóc tách và tạo bộ câu hỏi thành công.',
      };
    } catch (error: any) {
      this.logger.error(`[AI Question Lỗi]: ${error.message}`, error.stack);
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
      await this.cleanupTempFiles(payload.files.map((f) => f.filePath));
    }
  }

  /**
   * Bộ lọc rác Markdown bảo vệ JSON Parser
   */
  private extractJsonFromAiResponse(aiText: string): AiQuestionBankResponse {
    try {
      const cleanText = aiText
        .replace(/```json/gi, '')
        .replace(/```/gi, '')
        .trim();
      return JSON.parse(cleanText) as AiQuestionBankResponse;
    } catch (error) {
      this.logger.error(
        `[JSON Parse Error] AI format sai: ${aiText.substring(0, 200)}...`,
      );
      throw new InternalServerErrorException(
        'AI đã tạo phản hồi nhưng sai định dạng cấu trúc hệ thống.',
      );
    }
  }

  /**
   * Ép phẳng cây chuyên đề để mớm cho AI tra cứu
   */
  private flattenTopicTree(tree: any[], prefix = ''): string {
    let result = '';
    for (const node of tree) {
      result += `- ID: "${node._id.toString()}" | Chuyên đề: ${prefix}${node.name} (Level ${node.level})\n`;
      if (node.children && node.children.length > 0) {
        result += this.flattenTopicTree(node.children, prefix + '-- ');
      }
    }
    return result;
  }

  /**
   * System Prompt "Thần Thánh" ép khung Question & Passage
   */
  private buildExamSetterPrompt(
    topicsDict: string,
    extraInstructions?: string,
  ): string {
    return `
Bạn là một chuyên gia ra đề thi (Exam Setter) và phân tích dữ liệu giáo dục. Nhiệm vụ của bạn là đọc toàn bộ đề thi (bao gồm câu hỏi, bảng đáp án, và lời giải chi tiết), sau đó đối chiếu và gộp chúng lại thành một cấu trúc JSON hoàn chỉnh.

⚠️ TỪ ĐIỂN CHUYÊN ĐỀ (Dùng để gắn topicId):
${topicsDict || 'Không có chuyên đề nào. Bỏ qua trường topicId.'}

⚠️ YÊU CẦU BẮT BUỘC:
1. TRẢ VỀ DUY NHẤT một chuỗi JSON hợp lệ. Cấu trúc Root là: { "questions": [ ... ] }
2. Nhận diện chính xác 2 loại câu hỏi:
   - "MULTIPLE_CHOICE": Câu trắc nghiệm đơn lẻ.
   - "PASSAGE": Câu hỏi dạng Đọc hiểu, có một đoạn văn (content) làm gốc và chứa các câu hỏi con (subQuestions).
3. Gắn "topicId" (Dựa vào Từ điển Chuyên đề ở trên. Nếu không chắc chắn, hãy bỏ qua trường này).
4. Đánh giá "difficultyLevel" (Độ khó): "NB" (Nhận biết), "TH" (Thông hiểu), "VD" (Vận dụng), "VDC" (Vận dụng cao).
5. Phải đối chiếu ngược Câu hỏi với Bảng đáp án cuối đề để gán "isCorrect": true cho đáp án đúng.
6. Lời giải chi tiết (nếu có ở cuối đề) phải được gán vào trường "explanation" của câu hỏi tương ứng.
7. Mỗi câu trả lời (answers) phải BẮT BUỘC có trường "id" (Giá trị là "A", "B", "C" hoặc "D").

MẪU JSON CHUẨN:
{
  "questions": [
    {
      "type": "MULTIPLE_CHOICE",
      "content": "Nội dung câu hỏi 1...",
      "explanation": "Lời giải chi tiết...",
      "difficultyLevel": "TH",
      "topicId": "65ab...cdef",
      "answers": [
        { "id": "A", "content": "Đáp án A", "isCorrect": false },
        { "id": "B", "content": "Đáp án B", "isCorrect": true }
      ]
    },
    {
      "type": "PASSAGE",
      "content": "Nội dung đoạn văn đọc hiểu (Rất dài)...",
      "topicId": "65ab...cdef",
      "subQuestions": [
        {
          "content": "Nội dung câu hỏi con 1...",
          "explanation": "Lời giải...",
          "difficultyLevel": "NB",
          "answers": [
             { "id": "A", "content": "...", "isCorrect": true }
          ]
        }
      ]
    }
  ]
}
${extraInstructions ? `\nLƯU Ý THÊM: ${extraInstructions}` : ''}
    `.trim();
  }

  private async cleanupTempFiles(filePaths: string[]) {
    const unlinkPromises = filePaths.map((path) =>
      fs.unlink(path).catch(() => null),
    );
    await Promise.all(unlinkPromises);
  }
}
