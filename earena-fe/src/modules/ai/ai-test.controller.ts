// file: src/modules/ai/ai-test.controller.ts
import {
    Controller, Post, Body, UseGuards, UseInterceptors, UploadedFile,
    ParseFilePipe, MaxFileSizeValidator, FileValidator // [CTO FIX]: Import thêm FileValidator
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import { AiService } from './ai.service';
import { TestAiDto } from './dto/test-ai.dto';
import { AnalyzeDocumentDto } from './dto/analyze-document.dto';
import { GenerateTextPayload, AnalyzeDocumentPayload } from './interfaces/ai-provider.interface';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { Public } from 'src/common/decorators/public.decorator';

// =======================================================================
// [CTO UPGRADE]: Xây dựng Validator tùy chỉnh, bất tử trước mọi lỗi Regex
// =======================================================================
export class StrictFileTypeValidator extends FileValidator<any> {
    constructor() {
        super({});
    }

    isValid(file: Express.Multer.File): boolean {
        if (!file || !file.mimetype) return false;

        const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

        // Normalize mimetype: Cắt bỏ các charset rác từ Postman/Client (VD: application/pdf; charset=utf-8)
        const mimeType = file.mimetype.split(';')[0].trim().toLowerCase();

        return allowedMimeTypes.includes(mimeType);
    }

    buildErrorMessage(file: Express.Multer.File): string {
        return `Định dạng tệp ${file?.mimetype || 'không xác định'} không được hỗ trợ. Hệ thống chỉ chấp nhận PDF và Hình ảnh (JPEG, PNG, WEBP).`;
    }
}


@Controller('ai/test')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AiTestController {
    constructor(private readonly aiService: AiService) { }

    @Post('chat')
    @Public()
    async testChat(@Body() dto: TestAiDto) {
        const payload: GenerateTextPayload = {
            providerName: dto.providerName,
            modelId: dto.modelId,
            userMessage: dto.userMessage,
            systemPrompt: dto.systemPrompt,
            temperature: dto.temperature,
        };

        const result = await this.aiService.processTextRequest(payload);

        return {
            message: 'Gọi AI Model thành công',
            data: result,
        };
    }

    @Post('analyze-document')
    @Public()
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './temp_uploads',
            filename: (req, file, cb) => {
                const uniqueSuffix = `${uuidv4()}${extname(file.originalname)}`;
                cb(null, uniqueSuffix);
            }
        })
    }))
    async analyzeDocument(
        @Body() dto: AnalyzeDocumentDto,
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 20 * 1024 * 1024, message: 'Dung lượng file vượt quá 20MB' }),
                    // [CTO FIX]: Khởi chạy Custom Validator thay cho FileTypeValidator mặc định
                    new StrictFileTypeValidator(),
                ],
            }),
        ) file: Express.Multer.File,
    ) {
        const payload: AnalyzeDocumentPayload = {
            providerName: dto.providerName,
            modelId: dto.modelId,
            documents: [{
                filePath: file.path,
                mimeType: file.mimetype
            }],
            userMessage: dto.userMessage,
            systemPrompt: dto.systemPrompt,
            temperature: dto.temperature,
            responseFormat: dto.responseFormat,
        };

        const result = await this.aiService.processDocumentRequest(payload);

        return {
            message: 'Phân tích tài liệu thành công',
            data: result,
        };
    }
}