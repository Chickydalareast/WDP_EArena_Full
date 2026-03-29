import {
  Controller, Post, Get, Body, UseInterceptors, UploadedFile,
  ParseFilePipe, MaxFileSizeValidator, FileTypeValidator,
  UseGuards, Query, BadRequestException, HttpCode, HttpStatus
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { plainToInstance } from 'class-transformer';

import { MediaService } from './media.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { MediaContext } from './schemas/media.schema';
import { MediaResponseDto } from './dto/media-response.dto';
import { RequestUploadTicketDto, ConfirmUploadDto } from './dto/ticket.dto';
import { SyncCloudinaryDto } from './dto/sync-cloudinary.dto';
import { SyncCloudinaryPayload } from './interfaces/storage-provider.interface';

@Controller('media')
@UseGuards(JwtAuthGuard)
export class MediaController {
  constructor(private readonly mediaService: MediaService) { }

  // =======================================================================
  // [MAX PING]: LUỒNG MỚI CLOUDINARY DIRECT UPLOAD
  // =======================================================================

  @Get('signature')
  getSignature(
    @CurrentUser('userId') userId: string,
    @Query('context') contextInput: string
  ) {
    const isValidContext = Object.values(MediaContext).includes(contextInput as MediaContext);
    const context = isValidContext ? (contextInput as MediaContext) : MediaContext.GENERAL;

    return {
      message: 'Lấy chữ ký bảo mật thành công',
      data: this.mediaService.generateSignature(userId, context)
    };
  }

  @Post('upload/cloudinary/sync')
  @HttpCode(HttpStatus.CREATED)
  async syncCloudinary(
    @CurrentUser('userId') userId: string,
    @Body() dto: SyncCloudinaryDto
  ) {
    const payload: SyncCloudinaryPayload = {
      publicId: dto.publicId,
      format: dto.format,
      bytes: dto.bytes,
      originalName: dto.originalName,
      context: dto.context,
    };

    const media = await this.mediaService.syncCloudinaryMedia(userId, payload);

    return {
      message: 'Đồng bộ tài nguyên lưu trữ thành công',
      // [CTO FIX]: Data từ tầng Service (Repo trả về) đã là POJO nhờ .toJSON(). Truyền thẳng!
      data: plainToInstance(MediaResponseDto, media, { excludeExtraneousValues: true })
    };
  }

  // =======================================================================
  // [LUỒNG CŨ]: GOOGLE DRIVE VIDEO
  // =======================================================================

  @Post('upload/video/ticket')
  async requestVideoTicket() {
    throw new BadRequestException('API cấp vé Google Drive đã ngừng hoạt động để nâng cấp hạ tầng. Vui lòng cập nhật Frontend sử dụng luồng Cloudinary Direct Upload.');
  }

  @Post('upload/confirm')
  async confirmUpload(
    @CurrentUser('userId') userId: string,
    @Body() dto: ConfirmUploadDto
  ) {
    const media = await this.mediaService.confirmUpload(dto.mediaId, userId);
    return {
      message: 'Xác nhận lưu trữ file thành công',
      data: plainToInstance(MediaResponseDto, media, { excludeExtraneousValues: true })
    };
  }


  /**
   * @deprecated Hệ thống đã chuyển sang luồng Signature.
   */
  @Post('upload/single')
  @UseInterceptors(FileInterceptor('file'))
  async uploadSingle() {
    throw new BadRequestException('API này đã ngừng hỗ trợ. Vui lòng nâng cấp Frontend để sử dụng chuẩn Direct Upload mới.');
  }

  /**
   * @deprecated Đã khai tử Firebase
   */
  @Post('upload/document/ticket')
  async requestDocumentTicket() {
    throw new BadRequestException('Hệ thống lưu trữ tài liệu đã được nâng cấp. Vui lòng không sử dụng phương thức cũ.');
  }
}