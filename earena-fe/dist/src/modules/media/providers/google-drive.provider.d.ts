import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { IVideoProvider, StorageMetadata } from '../interfaces/storage-provider.interface';
export declare class GoogleDriveAdapter implements IVideoProvider, OnModuleInit {
    private readonly configService;
    private readonly logger;
    private drive;
    private folderId;
    private frontendOrigin;
    constructor(configService: ConfigService);
    onModuleInit(): void;
    createResumableUploadSession(fileMetadata: {
        name: string;
        mimeType: string;
        size: number;
    }): Promise<{
        uploadUrl: string;
        fileId: string;
    }>;
    verifyUpload(fileId: string): Promise<StorageMetadata>;
    deleteVideo(fileId: string): Promise<boolean>;
}
