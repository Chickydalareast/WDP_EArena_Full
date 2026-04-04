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
var AiCourseBuilderService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiCourseBuilderService = void 0;
const common_1 = require("@nestjs/common");
const fs = __importStar(require("fs/promises"));
const mammoth = __importStar(require("mammoth"));
const courses_repository_1 = require("../courses.repository");
const curriculum_service_1 = require("./curriculum.service");
const ai_service_1 = require("../../ai/ai.service");
const ai_provider_interface_1 = require("../../ai/interfaces/ai-provider.interface");
let AiCourseBuilderService = AiCourseBuilderService_1 = class AiCourseBuilderService {
    coursesRepo;
    curriculumService;
    aiService;
    logger = new common_1.Logger(AiCourseBuilderService_1.name);
    constructor(coursesRepo, curriculumService, aiService) {
        this.coursesRepo = coursesRepo;
        this.curriculumService = curriculumService;
        this.aiService = aiService;
    }
    async generateCurriculum(payload) {
        const course = await this.coursesRepo.findByIdSafe(payload.courseId, {
            select: 'teacherId',
        });
        if (!course)
            throw new common_1.NotFoundException('Khóa học không tồn tại.');
        if (course.teacherId.toString() !== payload.teacherId) {
            await this.cleanupTempFiles(payload.files.map((f) => f.filePath));
            throw new common_1.ForbiddenException('Bạn không có quyền chỉnh sửa khóa học này.');
        }
        try {
            this.logger.debug(`[AI Builder] Bắt đầu phân loại ${payload.files.length} file...`);
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
                    extractedText += `\n\n--- NỘI DUNG TÀI LIỆU (${file.originalName}) ---\n${result.value}\n`;
                }
                else if (mime === 'text/plain' || mime === 'application/json') {
                    const text = await fs.readFile(file.filePath, 'utf-8');
                    extractedText += `\n\n--- NỘI DUNG TÀI LIỆU (${file.originalName}) ---\n${text}\n`;
                }
            }
            const systemPrompt = this.buildInstructionalDesignerPrompt(payload.targetSectionCount, payload.additionalInstructions);
            const finalUserMessage = `Dưới đây là nội dung văn bản bóc tách từ tài liệu (nếu có):\n${extractedText}\n\nHãy kết hợp chúng với các file PDF đính kèm (nếu có) để tạo cấu trúc khóa học chuẩn.`;
            let aiResponse;
            if (pdfFiles.length > 0) {
                this.logger.debug(`[AI Engine] Kích hoạt luồng File API cho ${pdfFiles.length} file PDF...`);
                aiResponse = await this.aiService.processDocumentRequest({
                    providerName: ai_provider_interface_1.AiProviderName.GOOGLE,
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
            else {
                this.logger.debug(`[AI Engine] Kích hoạt luồng Text API thuần (Do chỉ có DOCX/TXT)...`);
                aiResponse = await this.aiService.processTextRequest({
                    providerName: ai_provider_interface_1.AiProviderName.GOOGLE,
                    modelId: 'gemini-2.5-flash',
                    systemPrompt: systemPrompt,
                    userMessage: finalUserMessage,
                    temperature: 0.2,
                    responseFormat: 'json_object',
                });
            }
            const jsonTree = this.extractJsonFromAiResponse(aiResponse.content);
            if (!jsonTree.curriculum ||
                !Array.isArray(jsonTree.curriculum) ||
                jsonTree.curriculum.length === 0) {
                throw new common_1.InternalServerErrorException('AI phân tích thành công nhưng không sinh ra được cấu trúc khóa học hợp lệ.');
            }
            this.logger.debug(`[AI Builder] Đã bóc xuất được ${jsonTree.curriculum.length} chương. Bắt đầu đẩy vào Database...`);
            await this.coursesRepo.executeInTransaction(async () => {
                await this.injectCurriculumTree(payload.courseId, payload.teacherId, jsonTree.curriculum);
            });
            return {
                status: 'SUCCESS',
                sectionsGenerated: jsonTree.curriculum.length,
                message: 'Khởi tạo cấu trúc khóa học tự động thành công.',
            };
        }
        catch (error) {
            this.logger.error(`[AI Course Builder Lỗi]: ${error.message}`, error.stack);
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
    async injectCurriculumTree(courseId, teacherId, curriculum) {
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
                        content: lesson.content || '<p>Nội dung bài học đang được cập nhật...</p>',
                        isFreePreview: false,
                    });
                }
            }
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
            this.logger.error(`[JSON Parse Error] AI trả về định dạng rỗng/sai: ${aiText.substring(0, 200)}...`);
            throw new common_1.InternalServerErrorException('AI đã tạo phản hồi nhưng không tuân thủ định dạng cấu trúc hệ thống.');
        }
    }
    buildInstructionalDesignerPrompt(targetCount, extraInstructions) {
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
    async cleanupTempFiles(filePaths) {
        const unlinkPromises = filePaths.map((path) => fs.unlink(path).catch(() => null));
        await Promise.all(unlinkPromises);
    }
};
exports.AiCourseBuilderService = AiCourseBuilderService;
exports.AiCourseBuilderService = AiCourseBuilderService = AiCourseBuilderService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [courses_repository_1.CoursesRepository,
        curriculum_service_1.CurriculumService,
        ai_service_1.AiService])
], AiCourseBuilderService);
//# sourceMappingURL=ai-course-builder.service.js.map