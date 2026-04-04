import { MediaContext } from '../schemas/media.schema';

export const CLOUDINARY_PROVIDER = 'CLOUDINARY_PROVIDER';
export const VIDEO_PROVIDER = 'VIDEO_PROVIDER';

export type StorageMetadata = {
  url: string;
  publicId: string;
  bytes: number;
  width?: number;
  height?: number;
  format?: string;
  duration?: number;
};

export type SyncCloudinaryPayload = {
  publicId: string;
  format: string;
  bytes: number;
  originalName: string;
  context: MediaContext;
};

export interface ITicketStorageProvider {
  verifyUpload(
    publicId: string,
    resourceType?: 'image' | 'video' | 'raw',
  ): Promise<StorageMetadata>;
}

export interface ICloudinaryProvider extends ITicketStorageProvider {
  uploadFileLocal(
    filePath: string,
    folder: string,
    publicId?: string,
  ): Promise<StorageMetadata>;

  uploadImageBuffer(
    buffer: Buffer, 
    folder: string
  ): Promise<StorageMetadata>;

  deleteFile(
    publicId: string,
    resourceType?: 'image' | 'video' | 'raw',
  ): Promise<boolean>;

  generateSignature(folder: string): any;

  generateSignedUrl(
    publicId: string,
    resourceType: 'image' | 'video' | 'raw',
    expiresInSeconds: number,
  ): string;
}

export interface IVideoProvider extends ITicketStorageProvider {
  createResumableUploadSession(
    fileMetadata: any,
  ): Promise<{ uploadUrl: string; fileId: string }>;
  
  deleteVideo(fileId: string): Promise<boolean>;
}