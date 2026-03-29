import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import sharp from 'sharp';
import { encode } from 'blurhash';
import { MediaRepository } from './media.repository';
import type { BlurhashJobData } from './media.service';

@Processor('media')
export class MediaProcessor extends WorkerHost {
  private readonly logger = new Logger(MediaProcessor.name);

  private readonly IMAGE_EXT_REGEX = /\.(jpg|jpeg|png|webp|heic)(\?.*)?$/i;

  constructor(private readonly mediaRepository: MediaRepository) {
    super();
  }

  async process(job: Job<BlurhashJobData>): Promise<void> {
    switch (job.name) {
      case 'generate-blurhash':
        await this.handleGenerateBlurhash(job);
        break;
      default:
        this.logger.warn(`[Worker] Bỏ qua job không xác định định tuyến: ${job.name}`);
    }
  }

  private async handleGenerateBlurhash(job: Job<BlurhashJobData>): Promise<void> {
    const { mediaId, url } = job.data;
    this.logger.debug(`[Worker] Đang xử lý Blurhash cho Media ID: ${mediaId}`);

    if (!this.IMAGE_EXT_REGEX.test(url) || !url.includes('cloudinary')) {
      this.logger.warn(`[Worker] Cảnh báo: URL không hợp lệ cho Blurhash. Hủy bỏ tác vụ ẩn. URL: ${url}`);
      return;
    }

    try {
      const microUrl = url.replace(/\/upload\/(v\d+\/)?/, '/upload/w_32,h_32,c_scale/$1');

      const response = await fetch(microUrl);
      if (!response.ok) {
        if (response.status >= 400 && response.status < 500) {
          this.logger.error(`[Worker] Cảnh báo từ CDN (Status: ${response.status}). URL bị lỗi, ngừng Retry.`);
          return; 
        }
        throw new Error(`Fetch CDN thất bại với status HTTP: ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { data: pixels, info } = await sharp(buffer)
        .raw()
        .ensureAlpha()
        .toBuffer({ resolveWithObject: true });

      const blurHash = encode(new Uint8ClampedArray(pixels), info.width, info.height, 4, 4);

      await this.mediaRepository.updateByIdSafe(mediaId, {
        $set: { blurHash },
      });

      this.logger.log(`✅ [Worker] Tạo Blurhash thành công cho Media ID: ${mediaId}`);
    } catch (error: any) {
      this.logger.error(`❌ [Worker] Lỗi System Blurhash [${mediaId}]: ${error.message}`);
      throw error;
    }
  }
}