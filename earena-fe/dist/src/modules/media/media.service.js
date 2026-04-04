"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var MediaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaService = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const mongoose_1 = require("mongoose");
const storage_provider_interface_1 = require("./interfaces/storage-provider.interface");
const media_repository_1 = require("./media.repository");
const media_schema_1 = require("./schemas/media.schema");
let MediaService = MediaService_1 = class MediaService {
    cloudinaryProvider;
    videoProvider;
    mediaRepository;
    mediaQueue;
    logger = new common_1.Logger(MediaService_1.name);
    uploadVerifiers;
    SUPPORTED_IMAGE_FORMATS = [
        'jpg',
        'jpeg',
        'png',
        'webp',
        'heic',
    ];
    SUPPORTED_VIDEO_FORMATS = [
        'mp4',
        'webm',
        'mkv',
        'mov',
        'avi',
    ];
    SUPPORTED_AUDIO_FORMATS = [
        'mp3',
        'wav',
        'ogg',
        'm4a',
        'mpeg',
    ];
    constructor(cloudinaryProvider, videoProvider, mediaRepository, mediaQueue) {
        this.cloudinaryProvider = cloudinaryProvider;
        this.videoProvider = videoProvider;
        this.mediaRepository = mediaRepository;
        this.mediaQueue = mediaQueue;
        this.uploadVerifiers = new Map([
            [media_schema_1.MediaProvider.GOOGLE_DRIVE, this.videoProvider],
        ]);
    }
    getSecureUrl(publicId, mimetype, expiresInSeconds = 7200) {
        const isVideo = mimetype?.toLowerCase().startsWith('video/');
        const isAudio = mimetype?.toLowerCase().startsWith('audio/');
        const resourceType = isVideo || isAudio ? 'video' : 'image';
        return this.cloudinaryProvider.generateSignedUrl(publicId, resourceType, expiresInSeconds);
    }
    generateSignature(userId, context) {
        const folder = `earena/${context}/${userId}`;
        return this.cloudinaryProvider.generateSignature(folder);
    }
    async syncCloudinaryMedia(userId, payload) {
        this.logger.debug(`[Sync] Đang verify file ${payload.publicId} từ FE...`);
        const formatLower = (payload.format || '').toLowerCase();
        const isVideo = this.SUPPORTED_VIDEO_FORMATS.includes(formatLower) ||
            payload.context === media_schema_1.MediaContext.LESSON_VIDEO;
        const isAudio = this.SUPPORTED_AUDIO_FORMATS.includes(formatLower);
        const resourceType = isVideo || isAudio ? 'video' : 'image';
        const metadata = await this.cloudinaryProvider.verifyUpload(payload.publicId, resourceType);
        const SYSTEM_MAX_BYTES = 2 * 1024 * 1024 * 1024;
        if (metadata.bytes > SYSTEM_MAX_BYTES || metadata.bytes === 0) {
            this.logger.error(`[Security] Dung lượng bất thường: ${metadata.bytes} bytes. Kích hoạt Rollback.`);
            await this.cloudinaryProvider
                .deleteFile(metadata.publicId, resourceType)
                .catch(() => null);
            throw new common_1.BadRequestException('Kích thước file không hợp lệ hoặc vượt giới hạn hệ thống.');
        }
        let resolvedMimetype = `image/${metadata.format}`;
        if (isVideo) {
            resolvedMimetype = `video/${metadata.format}`;
        }
        else if (isAudio) {
            resolvedMimetype =
                metadata.format === 'mp3' ? 'audio/mpeg' : `audio/${metadata.format}`;
        }
        else if (metadata.format === 'pdf') {
            resolvedMimetype = 'application/pdf';
        }
        const newMedia = await this.mediaRepository.createDocument({
            originalName: payload.originalName,
            publicId: metadata.publicId,
            url: metadata.url,
            mimetype: resolvedMimetype,
            size: metadata.bytes,
            width: metadata.width,
            height: metadata.height,
            duration: metadata.duration,
            provider: media_schema_1.MediaProvider.CLOUDINARY,
            status: media_schema_1.MediaStatus.READY,
            uploadedBy: new mongoose_1.Types.ObjectId(userId),
            context: payload.context,
        });
        if (!isVideo &&
            !isAudio &&
            this.SUPPORTED_IMAGE_FORMATS.includes(formatLower)) {
            await this.mediaQueue.add('generate-blurhash', {
                mediaId: newMedia._id.toString(),
                url: metadata.url,
            }, {
                attempts: 3,
                backoff: { type: 'exponential', delay: 2000 },
            });
        }
        else {
            this.logger.debug(`[Router] Bỏ qua worker Blurhash cho file format: ${formatLower}`);
        }
        return newMedia;
    }
    async requestVideoUploadTicket(userId, payload) {
        const { uploadUrl, fileId } = await this.videoProvider.createResumableUploadSession({
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
            provider: media_schema_1.MediaProvider.GOOGLE_DRIVE,
            status: media_schema_1.MediaStatus.PENDING,
            uploadedBy: new mongoose_1.Types.ObjectId(userId),
            context: payload.context,
        });
        return { mediaId: newMedia._id.toString(), uploadUrl };
    }
    async confirmUpload(mediaId, userId) {
        const media = await this.mediaRepository.findByIdSafe(mediaId);
        if (!media)
            throw new common_1.BadRequestException('Bản ghi tài nguyên không tồn tại');
        if (media.uploadedBy.toString() !== userId)
            throw new common_1.ForbiddenException('Bạn không có quyền xác nhận file này');
        if (media.status === media_schema_1.MediaStatus.READY)
            return media;
        const verifier = this.uploadVerifiers.get(media.provider);
        if (!verifier) {
            throw new common_1.InternalServerErrorException(`Hệ thống chưa hỗ trợ xác nhận luồng PENDING cho nền tảng: ${media.provider}`);
        }
        try {
            const metadata = await verifier.verifyUpload(media.publicId);
            if (metadata.bytes === 0)
                throw new common_1.BadRequestException('Tệp tin rỗng (0 bytes).');
            const updatedMedia = await this.mediaRepository.updateByIdSafe(mediaId, {
                $set: {
                    status: media_schema_1.MediaStatus.READY,
                    size: metadata.bytes,
                    duration: metadata.duration,
                    url: metadata.url,
                },
            });
            return updatedMedia;
        }
        catch (error) {
            this.logger.error(`❌ Xác nhận file thất bại [${mediaId}]: ${error.message}`);
            throw new common_1.BadRequestException(error.message || 'Không thể xác minh file trên hệ thống lưu trữ.');
        }
    }
    async uploadSingleFromFile(file, userId, context) {
        throw new common_1.BadRequestException('Hàm upload file đồng bộ đã bị khóa. Vui lòng dùng luồng Signature mới.');
    }
};
exports.MediaService = MediaService;
exports.MediaService = MediaService = MediaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(storage_provider_interface_1.CLOUDINARY_PROVIDER)),
    __param(1, (0, common_1.Inject)(storage_provider_interface_1.VIDEO_PROVIDER)),
    __param(3, (0, bullmq_1.InjectQueue)('media')),
    __metadata("design:paramtypes", [Object, Object, media_repository_1.MediaRepository,
        bullmq_2.Queue])
], MediaService);
//# sourceMappingURL=media.service.js.map