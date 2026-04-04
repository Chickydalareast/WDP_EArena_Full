import { Queue } from 'bullmq';
import { MediaRepository } from './media.repository';
import { MediaContext, MediaDocument } from './schemas/media.schema';
import type { ICloudinaryProvider, IVideoProvider, SyncCloudinaryPayload } from './interfaces/storage-provider.interface';
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
export declare class MediaService {
    private readonly cloudinaryProvider;
    private readonly videoProvider;
    private readonly mediaRepository;
    private readonly mediaQueue;
    private readonly logger;
    private readonly uploadVerifiers;
    private readonly SUPPORTED_IMAGE_FORMATS;
    private readonly SUPPORTED_VIDEO_FORMATS;
    private readonly SUPPORTED_AUDIO_FORMATS;
    constructor(cloudinaryProvider: ICloudinaryProvider, videoProvider: IVideoProvider, mediaRepository: MediaRepository, mediaQueue: Queue<BlurhashJobData>);
    getSecureUrl(publicId: string, mimetype: string, expiresInSeconds?: number): string;
    generateSignature(userId: string, context: MediaContext): any;
    syncCloudinaryMedia(userId: string, payload: SyncCloudinaryPayload): Promise<MediaDocument>;
    requestVideoUploadTicket(userId: string, payload: RequestTicketPayload): Promise<{
        mediaId: string;
        uploadUrl: string;
    }>;
    confirmUpload(mediaId: string, userId: string): Promise<MediaDocument>;
    uploadSingleFromFile(file: Express.Multer.File, userId: string, context: MediaContext): Promise<any>;
}
