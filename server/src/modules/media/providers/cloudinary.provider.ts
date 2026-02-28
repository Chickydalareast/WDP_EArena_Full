import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import * as streamifier from 'streamifier';
import type { IStorageProvider, StorageMetadata } from '../interfaces/storage-provider.interface';

@Injectable()
export class CloudinaryAdapter implements IStorageProvider {
  private readonly logger = new Logger(CloudinaryAdapter.name);

  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });

    cloudinary.api.ping()
      .then(() => this.logger.log('✅ Khởi tạo và kết nối Cloudinary thành công!'))
      .catch((err) => {
        this.logger.error('❌ Kết nối Cloudinary thất bại. Hãy kiểm tra lại API Key!');
        this.logger.error(err);
      });
  }

  async uploadImage(buffer: Buffer, folder: string, publicId?: string): Promise<StorageMetadata> {
    this.logger.debug(`Bắt đầu đẩy luồng Stream (${Math.round(buffer.length / 1024)}KB) lên Cloudinary [Folder: ${folder}]...`);
    
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          public_id: publicId,
          resource_type: 'image',
        },
        (error, result: UploadApiResponse) => {
          if (error) {
            this.logger.error(`❌ Upload thất bại: ${error.message}`);
            return reject(new InternalServerErrorException('Lỗi hệ thống khi tải ảnh lên đám mây'));
          }
          if (result) {
            this.logger.log(`✅ Upload thành công: ${result.secure_url}`);
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
              bytes: result.bytes,
              width: result.width,
              height: result.height,
              format: result.format,
            });
          } else {
            reject(new InternalServerErrorException('Không nhận được phản hồi từ máy chủ ảnh'));
          }
        },
      );

      streamifier.createReadStream(buffer).pipe(uploadStream);
    });
  }

  async deleteImage(publicId: string): Promise<boolean> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result.result === 'ok';
    } catch (error) {
      this.logger.error(`❌ Xóa file thất bại [${publicId}]: ${error.message}`);
      return false;
    }
  }
}