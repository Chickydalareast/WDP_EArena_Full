import {
  Inject,
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Types } from 'mongoose';
import * as path from 'path';
import * as os from 'os';
import { v4 as uuidv4 } from 'uuid';

import {
  CLOUDINARY_PROVIDER,
  VIDEO_PROVIDER,
} from './interfaces/storage-provider.interface';
import { MediaRepository } from './media.repository';
import {
  MediaContext,
  MediaDocument,
  MediaProvider,
  MediaStatus,
} from './schemas/media.schema';
import type {
  ICloudinaryProvider,
  IVideoProvider,
  StorageMetadata,
  ITicketStorageProvider,
  SyncCloudinaryPayload,
} from './interfaces/storage-provider.interface';

// Giữ lại type cũ để dĩ hòa vi quý luồng video
export type RequestTicketPayload = {
  fileName: string;
  mimeType: string;
  size: number;
  context: MediaContext;
};

export interface BlurhashJobData {
  mediaId: string;
  url: string;
}

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);
  private readonly uploadVerifiers: Map<MediaProvider, ITicketStorageProvider>;

  private readonly SUPPORTED_IMAGE_FORMATS = [
    'jpg',
    'jpeg',
    'png',
    'webp',
    'heic',
  ];
  private readonly SUPPORTED_VIDEO_FORMATS = [
    'mp4',
    'webm',
    'mkv',
    'mov',
    'avi',
  ];
  private readonly SUPPORTED_AUDIO_FORMATS = [
    'mp3',
    'wav',
    'ogg',
    'm4a',
    'mpeg',
  ];

  constructor(
    @Inject(CLOUDINARY_PROVIDER)
    private readonly cloudinaryProvider: ICloudinaryProvider,
    @Inject(VIDEO_PROVIDER) private readonly videoProvider: IVideoProvider,
    private readonly mediaRepository: MediaRepository,
    @InjectQueue('media') private readonly mediaQueue: Queue<BlurhashJobData>,
  ) {
    this.uploadVerifiers = new Map<MediaProvider, ITicketStorageProvider>([
      [MediaProvider.GOOGLE_DRIVE, this.videoProvider],
    ]);
  }

  getSecureUrl(
    publicId: string,
    mimetype: string,
    expiresInSeconds: number = 7200,
  ): string {
    const isVideo = mimetype?.toLowerCase().startsWith('video/');
    const isAudio = mimetype?.toLowerCase().startsWith('audio/');
    const resourceType = isVideo || isAudio ? 'video' : 'image';

    return this.cloudinaryProvider.generateSignedUrl(
      publicId,
      resourceType,
      expiresInSeconds,
    );
  }

  generateSignature(userId: string, context: MediaContext) {
    const folder = `earena/${context}/${userId}`;
    return this.cloudinaryProvider.generateSignature(folder);
  }

  // =======================================================================
  // [MAX PING]: LUỒNG ĐỒNG BỘ TRỰC TIẾP TỪ CLOUDINARY (OPTION A)
  // Service không hề biết về DTO, chỉ nhận Payload thuần.
  // =======================================================================
  async syncCloudinaryMedia(
    userId: string,
    payload: SyncCloudinaryPayload,
  ): Promise<MediaDocument> {
    this.logger.debug(`[Sync] Đang verify file ${payload.publicId} từ FE...`);

    // 1. Não bộ định tuyến: Quyết định Type cho Cloudinary SDK khỏi mò mẫm
    const formatLower = (payload.format || '').toLowerCase();
    const isVideo =
      this.SUPPORTED_VIDEO_FORMATS.includes(formatLower) ||
      payload.context === MediaContext.LESSON_VIDEO;
    const isAudio = this.SUPPORTED_AUDIO_FORMATS.includes(formatLower);

    // [MAX PING]: Cloudinary quản lý cả Video và Audio dưới chung một resource_type là 'video'
    const resourceType: 'image' | 'video' | 'raw' =
      isVideo || isAudio ? 'video' : 'image';

    // 2. Kiểm toán chéo: Truyền đúng resourceType xuống Adapter mới
    const metadata = await this.cloudinaryProvider.verifyUpload(
      payload.publicId,
      resourceType,
    );

    // 3. Kiểm tra dung lượng (Chống vượt rào)
    const SYSTEM_MAX_BYTES = 2 * 1024 * 1024 * 1024; // 2GB
    if (metadata.bytes > SYSTEM_MAX_BYTES || metadata.bytes === 0) {
      this.logger.error(
        `[Security] Dung lượng bất thường: ${metadata.bytes} bytes. Kích hoạt Rollback.`,
      );
      await this.cloudinaryProvider
        .deleteFile(metadata.publicId, resourceType)
        .catch(() => null);
      throw new BadRequestException(
        'Kích thước file không hợp lệ hoặc vượt giới hạn hệ thống.',
      );
    }

    // 4. Xử lý Mimetype chuẩn chỉ cho Database
    // [MAX PING]: Phân giải chính xác Mimetype để FE dùng thẻ <audio> không bị lỗi
    let resolvedMimetype = `image/${metadata.format}`;
    if (isVideo) {
      resolvedMimetype = `video/${metadata.format}`;
    } else if (isAudio) {
      // Fix cứng chuẩn mpeg cho đuôi mp3
      resolvedMimetype =
        metadata.format === 'mp3' ? 'audio/mpeg' : `audio/${metadata.format}`;
    } else if (metadata.format === 'pdf') {
      resolvedMimetype = 'application/pdf';
    }

    // 5. Khởi tạo bản ghi Database
    const newMedia = await this.mediaRepository.createDocument({
      originalName: payload.originalName,
      publicId: metadata.publicId,
      url: metadata.url,
      mimetype: resolvedMimetype,
      size: metadata.bytes,
      width: metadata.width,
      height: metadata.height,
      duration: metadata.duration, // [NEW] Kéo duration chuẩn từ video/audio
      provider: MediaProvider.CLOUDINARY,
      status: MediaStatus.READY,
      uploadedBy: new Types.ObjectId(userId),
      context: payload.context,
    });

    // 6. Định tuyến Job Background: Chỉ cho Image vào lò Blurhash, tha cho Video/Audio
    if (
      !isVideo &&
      !isAudio &&
      this.SUPPORTED_IMAGE_FORMATS.includes(formatLower)
    ) {
      await this.mediaQueue.add(
        'generate-blurhash',
        {
          mediaId: newMedia._id.toString(),
          url: metadata.url,
        },
        {
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
        },
      );
    } else {
      this.logger.debug(
        `[Router] Bỏ qua worker Blurhash cho file format: ${formatLower}`,
      );
    }

    return newMedia;
  }

  // =======================================================================
  // [LEGACY CODE]: VẪN DUY TRÌ LUỒNG CŨ ĐỂ DĨ HÒA VI QUÝ
  // =======================================================================

  async requestVideoUploadTicket(
    userId: string,
    payload: RequestTicketPayload,
  ) {
    const { uploadUrl, fileId } =
      await this.videoProvider.createResumableUploadSession({
        name: payload.fileName,
        mimeType: payload.mimeType,
        size: payload.size,
      });

    const newMedia = await this.mediaRepository.createDocument({
      originalName: payload.fileName,
      publicId: fileId,
      url: 'pending_video_url',
      mimetype: payload.mimeType,
      size: payload.size,
      provider: MediaProvider.GOOGLE_DRIVE,
      status: MediaStatus.PENDING,
      uploadedBy: new Types.ObjectId(userId),
      context: payload.context,
    });

    return { mediaId: newMedia._id.toString(), uploadUrl };
  }

  async confirmUpload(mediaId: string, userId: string): Promise<MediaDocument> {
    const media = await this.mediaRepository.findByIdSafe(mediaId);
    if (!media)
      throw new BadRequestException('Bản ghi tài nguyên không tồn tại');
    if (media.uploadedBy.toString() !== userId)
      throw new ForbiddenException('Bạn không có quyền xác nhận file này');

    if (media.status === MediaStatus.READY) return media;

    const verifier = this.uploadVerifiers.get(media.provider);
    if (!verifier) {
      throw new InternalServerErrorException(
        `Hệ thống chưa hỗ trợ xác nhận luồng PENDING cho nền tảng: ${media.provider}`,
      );
    }

    try {
      const metadata = await verifier.verifyUpload(media.publicId);
      if (metadata.bytes === 0)
        throw new BadRequestException('Tệp tin rỗng (0 bytes).');

      const updatedMedia = await this.mediaRepository.updateByIdSafe(mediaId, {
        $set: {
          status: MediaStatus.READY,
          size: metadata.bytes,
          duration: metadata.duration,
          url: metadata.url,
        },
      });

      return updatedMedia!;
    } catch (error: any) {
      this.logger.error(
        `❌ Xác nhận file thất bại [${mediaId}]: ${error.message}`,
      );
      throw new BadRequestException(
        error.message || 'Không thể xác minh file trên hệ thống lưu trữ.',
      );
    }
  }

  // Luồng upload qua server cũ (Đã được controller khóa mồm nhưng service vẫn giữ để FE không sập chùm)
  async uploadSingleFromFile(
    file: Express.Multer.File,
    userId: string,
    context: MediaContext,
  ): Promise<any> {
    // Tạm để nguyên code cũ ở đây nếu hệ thống FE vẫn đang còn dùng.
    // Nếu rảnh, tôi sẽ xóa nó ở Phase dọn rác.
    throw new BadRequestException(
      'Hàm upload file đồng bộ đã bị khóa. Vui lòng dùng luồng Signature mới.',
    );
  }
}
