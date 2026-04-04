"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AiQuestionBuilderService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiQuestionBuilderService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("mongoose");
const fs = __importStar(require("fs/promises"));
const mammoth = __importStar(require("mammoth"));
const question_folders_repository_1 = require("../question-folders.repository");
const users_service_1 = require("../../users/users.service");
const ai_service_1 = require("../../ai/ai.service");
const ai_provider_interface_1 = require("../../ai/interfaces/ai-provider.interface");
const knowledge_topics_service_1 = require("../../taxonomy/knowledge-topics.service");
const questions_service_1 = require("../questions.service");
let AiQuestionBuilderService = AiQuestionBuilderService_1 = class AiQuestionBuilderService {
    foldersRepo;
    usersService;
    aiService;
    topicsService;
    questionsService;
    logger = new common_1.Logger(AiQuestionBuilderService_1.name);
    constructor(foldersRepo, usersService, aiService, topicsService, questionsService) {
        this.foldersRepo = foldersRepo;
        this.usersService = usersService;
        this.aiService = aiService;
        this.topicsService = topicsService;
        this.questionsService = questionsService;
    }
    async generateQuestionBank(payload) {
        try {
            this.logger.debug(`[AI Builder] Bắt đầu phân tích đề thi cho User ${payload.teacherId}`);
            const folder = await this.foldersRepo.findByIdSafe(new mongoose_1.Types.ObjectId(payload.folderId));
            if (!folder || folder.ownerId.toString() !== payload.teacherId) {
                throw new common_1.ForbiddenException('Thư mục đích không tồn tại hoặc bạn không có quyền thao tác.');
            }
            const teacher = await this.usersService.findById(payload.teacherId);
            if (!teacher || !teacher.subjectIds || teacher.subjectIds.length === 0) {
                throw new common_1.BadRequestException('Tài khoản của bạn chưa được phân công giảng dạy bộ môn nào. Vui lòng liên hệ Admin.');
            }
            const firstSubject = teacher.subjectIds[0];
            const targetSubjectId = firstSubject._id
                ? firstSubject._id.toString()
                : firstSubject.toString();
            if (!mongoose_1.Types.ObjectId.isValid(targetSubjectId)) {
                throw new common_1.InternalServerErrorException(`Lỗi dữ liệu hệ thống: Mã môn học của giáo viên không hợp lệ (${targetSubjectId}).`);
            }
            const rawTopicTree = await this.topicsService.getTreeBySubject(targetSubjectId);
            const flatTopicsDict = this.flattenTopicTree(rawTopicTree);
            const pdfFiles = [];
            let extractedText = '';
            for (const file of payload.files) {
                const mime = file.mimeType.toLowerCase();
                if (mime === 'application/pdf') {
                    pdfFiles.push(file);
                }
                else if (mime ===
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                    const result = await mammoth.extractRawText({ path: file.filePath });
                    extractedText += `\n\n--- ĐỀ THI (${file.originalName}) ---\n${result.value}\n`;
                }
                else if (mime === 'text/plain' || mime === 'application/json') {
                    extractedText += `\n\n--- ĐỀ THI (${file.originalName}) ---\n${await fs.readFile(file.filePath, 'utf-8')}\n`;
                }
            }
            const systemPrompt = this.buildExamSetterPrompt(flatTopicsDict, payload.additionalInstructions);
            const finalUserMessage = `Dưới đây là văn bản bóc tách từ đề thi (nếu có):\n${extractedText}\n\nHãy kết hợp với file PDF đính kèm (nếu có) để tạo bộ câu hỏi JSON.`;
            let aiResponse;
            if (pdfFiles.length > 0) {
                this.logger.debug(`[AI Engine] Đang gọi Google Gemini Flash (Multimodal) cho ${pdfFiles.length} file PDF...`);
                aiResponse = await this.aiService.processDocumentRequest({
                    providerName: ai_provider_interface_1.AiProviderName.GOOGLE,
                    modelId: 'gemini-2.5-flash',
                    documents: pdfFiles.map((f) => ({
                        filePath: f.filePath,
                        mimeType: f.mimeType,
                    })),
                    systemPrompt: systemPrompt,
                    userMessage: finalUserMessage,
                    temperature: 0.1,
                    responseFormat: 'json_object',
                });
            }
            else {
                this.logger.debug(`[AI Engine] Đang gọi Google Gemini Flash (Text Only) cho file DOCX...`);
                aiResponse = await this.aiService.processTextRequest({
                    providerName: ai_provider_interface_1.AiProviderName.GOOGLE,
                    modelId: 'gemini-2.5-flash',
                    systemPrompt: systemPrompt,
                    userMessage: finalUserMessage,
                    temperature: 0.1,
                    responseFormat: 'json_object',
                });
            }
            const jsonBank = this.extractJsonFromAiResponse(aiResponse.content);
            if (!jsonBank.questions ||
                !Array.isArray(jsonBank.questions) ||
                jsonBank.questions.length === 0) {
                throw new common_1.InternalServerErrorException('AI đã chạy nhưng không bóc tách được câu hỏi nào.');
            }
            this.logger.debug(`[AI Builder] Bóc thành công ${jsonBank.questions.length} câu. Bắt đầu lưu DB...`);
            await this.questionsService.bulkCreateQuestions({
                ownerId: payload.teacherId,
                folderId: payload.folderId,
                questions: jsonBank.questions,
            });
            return {
                status: 'SUCCESS',
                questionsGenerated: jsonBank.questions.length,
                message: 'Đã bóc tách và tạo bộ câu hỏi thành công.',
            };
        }
        catch (error) {
            this.logger.error(`[AI Question Lỗi]: ${error.message}`, error.stack);
            if (error instanceof common_1.BadRequestException ||
                error instanceof common_1.NotFoundException ||
                error instanceof common_1.ForbiddenException) {
                throw error;
            }
            throw new common_1.BadRequestException(`Quá trình AI xử lý thất bại: ${error.message}`);
        }
        finally {
            await this.cleanupTempFiles(payload.files.map((f) => f.filePath));
        }
    }
    extractJsonFromAiResponse(aiText) {
        try {
            const cleanText = aiText
                .replace(/```json/gi, '')
                .replace(/```/gi, '')
                .trim();
            return JSON.parse(cleanText);
        }
        catch (error) {
            this.logger.error(`[JSON Parse Error] AI format sai: ${aiText.substring(0, 200)}...`);
            throw new common_1.InternalServerErrorException('AI đã tạo phản hồi nhưng sai định dạng cấu trúc hệ thống.');
        }
    }
    flattenTopicTree(tree, prefix = '') {
        let result = '';
        for (const node of tree) {
            result += `- ID: "${node._id.toString()}" | Chuyên đề: ${prefix}${node.name} (Level ${node.level})\n`;
            if (node.children && node.children.length > 0) {
                result += this.flattenTopicTree(node.children, prefix + '-- ');
            }
        }
        return result;
    }
    buildExamSetterPrompt(topicsDict, extraInstructions) {
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
    async cleanupTempFiles(filePaths) {
        const unlinkPromises = filePaths.map((path) => fs.unlink(path).catch(() => null));
        await Promise.all(unlinkPromises);
    }
};
exports.AiQuestionBuilderService = AiQuestionBuilderService;
exports.AiQuestionBuilderService = AiQuestionBuilderService = AiQuestionBuilderService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [question_folders_repository_1.QuestionFoldersRepository,
        users_service_1.UsersService,
        ai_service_1.AiService,
        knowledge_topics_service_1.KnowledgeTopicsService,
        questions_service_1.QuestionsService])
], AiQuestionBuilderService);
//# sourceMappingURL=ai-question-builder.service.js.map