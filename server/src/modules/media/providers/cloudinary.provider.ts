import { Injectable, InternalServerErrorException, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import type { ICloudinaryProvider, StorageMetadata } from '../interfaces/storage-provider.interface';

@Injectable()
export class CloudinaryAdapter implements ICloudinaryProvider {
  private readonly logger = new Logger(CloudinaryAdapter.name);

  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  generateSignature(folder: string): any {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      this.configService.get<string>('CLOUDINARY_API_SECRET')!
    );

    return {
      timestamp,
      signature,
      cloudName: this.configService.get<string>('CLOUDINARY_CLOUD_NAME')!,
      apiKey: this.configService.get<string>('CLOUDINARY_API_KEY')!,
      folder,
    };
  }

  async uploadFileLocal(filePath: string, folder: string, publicId?: string): Promise<StorageMetadata> {
    this.logger.debug(`Đẩy file nội bộ lên Cloudinary [Folder: ${folder}]...`);
    try {
      const result: UploadApiResponse = await cloudinary.uploader.upload(filePath, {
        folder: folder,
        public_id: publicId,
        resource_type: 'auto',
      });

      return {
        url: result.secure_url,
        publicId: result.public_id,
        bytes: result.bytes,
        width: result.width,
        height: result.height,
        format: result.format,
      };
    } catch (error: any) {
      this.logger.error(`Upload file thất bại: ${error.message}`);
      throw new InternalServerErrorException('Lỗi hệ thống khi tải tài nguyên lên đám mây');
    }
  }

  async deleteFile(publicId: string, resourceType: 'image' | 'video' | 'raw' = 'image'): Promise<boolean> {
    try {
      let result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
      
      if (result.result === 'not found' && resourceType === 'image') {
        this.logger.debug(`Không tìm thấy file dạng Image, thử quét dạng Raw: ${publicId}`);
        result = await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
      }

      return result.result === 'ok';
    } catch (error: any) {
      this.logger.error(`Xóa file Cloudinary thất bại [${publicId}]: ${error.message}`);
      return false;
    }
  }

  async verifyUpload(publicId: string, resourceType: 'image' | 'video' | 'raw' = 'image'): Promise<StorageMetadata> {
    try {
      const result = await cloudinary.api.resource(publicId, { resource_type: resourceType });

      return {
        url: result.secure_url,
        publicId: result.public_id,
        bytes: result.bytes,
        width: result.width,
        height: result.height,
        format: result.format,
        duration: result.duration,
      };
    } catch (error: any) {
      this.logger.error(`Lỗi kiểm toán Cloudinary [${publicId}] (Type: ${resourceType}): ${error.message}`);
      
      if (error.http_code === 404) {
        throw new BadRequestException(`Xác minh thất bại: Bản ghi [${publicId}] không tồn tại ở phân vùng [${resourceType}].`);
      }
      
      throw new InternalServerErrorException('Hệ thống giám định lưu trữ đám mây đang gặp sự cố. Vui lòng thử lại sau.');
    }
  }

  generateSignedUrl(publicId: string, resourceType: 'image' | 'video' | 'raw' = 'image', expiresInSeconds: number = 3600): string {
    const expiration = Math.floor(Date.now() / 1000) + expiresInSeconds;
    
    return cloudinary.url(publicId, {
      resource_type: resourceType,
      secure: true,
      sign_url: true, 
      expires_at: expiration
    });
  }
}