import { ConfigService } from '@nestjs/config';
import type { ICloudinaryProvider, StorageMetadata } from '../interfaces/storage-provider.interface';
export declare class CloudinaryAdapter implements ICloudinaryProvider {
    private configService;
    private readonly logger;
    constructor(configService: ConfigService);
    generateSignature(folder: string): any;
    uploadFileLocal(filePath: string, folder: string, publicId?: string): Promise<StorageMetadata>;
    uploadImageBuffer(buffer: Buffer, folder: string): Promise<StorageMetadata>;
    deleteFile(publicId: string, resourceType?: 'image' | 'video' | 'raw'): Promise<boolean>;
    verifyUpload(publicId: string, resourceType?: 'image' | 'video' | 'raw'): Promise<StorageMetadata>;
    generateSignedUrl(publicId: string, resourceType?: 'image' | 'video' | 'raw', expiresInSeconds?: number): string;
}
