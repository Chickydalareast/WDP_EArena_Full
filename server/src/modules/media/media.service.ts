import { Inject, Injectable, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { Types } from 'mongoose';
import sharp from 'sharp';
import { encode } from 'blurhash';
import { v4 as uuidv4 } from 'uuid';

import { STORAGE_PROVIDER } from './interfaces/storage-provider.interface';
import { MediaRepository } from './media.repository';
import { MediaContext, MediaDocument } from './schemas/media.schema';

import type { IStorageProvider, StorageMetadata } from './interfaces/storage-provider.interface';
import type { Express } from 'express';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(
    @Inject(STORAGE_PROVIDER) private readonly storageProvider: IStorageProvider,
    private readonly mediaRepository: MediaRepository,
  ) {}

  private async _processImage(buffer: Buffer) {
    try {
      const image = sharp(buffer);
      const metadata = await image.metadata();

      let pipeline = image;
      // Giới hạn max width 1920px để tránh user up ảnh 8K làm nổ RAM
      if (metadata.width && metadata.width > 1920) {
        pipeline = pipeline.resize({ width: 1920, fit: 'inside' });
      }

      // Convert mọi thứ sang WebP để tối ưu băng thông
      const processedBuffer = await pipeline.webp({ quality: 80, effort: 3 }).toBuffer();
      const finalMetadata = await sharp(processedBuffer).metadata();

      return {
        buffer: processedBuffer,
        width: finalMetadata.width || metadata.width || 0,
        height: finalMetadata.height || metadata.height || 0,
      };
    } catch (error) {
      this.logger.error('Lỗi xử lý ảnh Sharp:', error);
      throw new InternalServerErrorException('Tệp tin không đúng định dạng ảnh hoặc bị hỏng');
    }
  }

  private async _generateBlurHash(buffer: Buffer): Promise<string | null> {
    try {
      const { data, info } = await sharp(buffer)
        .raw()
        .ensureAlpha()
        .resize(32, 32, { fit: 'inside' })
        .toBuffer({ resolveWithObject: true });

      return encode(new Uint8ClampedArray(data), info.width, info.height, 4, 4);
    } catch (error) {
      this.logger.error('Lỗi tạo BlurHash:', error);
      return null;
    }
  }


  async uploadSingle(
    file: Express.Multer.File, 
    userId: string, 
    context: MediaContext = MediaContext.GENERAL
  ): Promise<MediaDocument> {
    if (!file) throw new BadRequestException('Vui lòng đính kèm tệp tin');

    const { buffer: optimizedBuffer, width, height } = await this._processImage(file.buffer);

    const blurHash = await this._generateBlurHash(optimizedBuffer);

    const folder = `earena/${context}/${userId}`;
    const targetPublicId = uuidv4(); 
    let uploadResult: StorageMetadata;

    try {
      uploadResult = await this.storageProvider.uploadImage(optimizedBuffer, folder, targetPublicId);
    } catch (error) {
      throw new InternalServerErrorException('Lỗi hệ thống khi tải tệp lên máy chủ đám mây');
    }

    try {
      const newMedia = await this.mediaRepository.create({
        originalName: file.originalname,
        publicId: uploadResult.publicId,
        url: uploadResult.url,
        mimetype: 'image/webp',
        size: uploadResult.bytes,
        width,
        height,
        blurHash,
        uploadedBy: new Types.ObjectId(userId) as any,
        context,
      } as any);

      return newMedia;
    } catch (dbError) {
      this.logger.error(`❌ Lỗi lưu DB. Đang Rollback hủy file trên Cloudinary: ${uploadResult.publicId}`);
      this.storageProvider.deleteImage(uploadResult.publicId).catch(err => {
        this.logger.error(`Cảnh báo: Không thể Rollback file ${uploadResult.publicId}`, err);
      });
      throw new InternalServerErrorException('Lỗi lưu trữ dữ liệu. Giao dịch đã bị hủy bỏ.');
    }
  }
}