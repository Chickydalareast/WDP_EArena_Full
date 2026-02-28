import { 
  Controller, 
  Post, 
  Body,
  UseInterceptors, 
  UploadedFile, 
  ParseFilePipe, 
  MaxFileSizeValidator, 
  FileTypeValidator, 
  UseGuards,
  Req
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { MediaContext } from './schemas/media.schema';
import type { Express, Request } from 'express';

@Controller('media')
@UseGuards(JwtAuthGuard)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload/single')
  @UseInterceptors(FileInterceptor('file'))
  async uploadSingle(
    @Req() req: Request,
    @Body('context') contextInput: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB Limit
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg|webp)' }), 
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const userId = (req.user as any).userId;
    
    // Ép kiểu context an toàn, nếu client gửi rác thì quy về GENERAL
    const isValidContext = Object.values(MediaContext).includes(contextInput as MediaContext);
    const context = isValidContext ? (contextInput as MediaContext) : MediaContext.GENERAL;

    return this.mediaService.uploadSingle(file, userId, context);
  }
}