import { MediaService } from './media.service';
import { MediaResponseDto } from './dto/media-response.dto';
import { ConfirmUploadDto } from './dto/ticket.dto';
import { SyncCloudinaryDto } from './dto/sync-cloudinary.dto';
export declare class MediaController {
    private readonly mediaService;
    constructor(mediaService: MediaService);
    getSignature(userId: string, contextInput: string): {
        message: string;
        data: any;
    };
    syncCloudinary(userId: string, dto: SyncCloudinaryDto): Promise<{
        message: string;
        data: MediaResponseDto;
    }>;
    requestVideoTicket(): Promise<void>;
    confirmUpload(userId: string, dto: ConfirmUploadDto): Promise<{
        message: string;
        data: MediaResponseDto;
    }>;
    uploadSingle(): Promise<void>;
    requestDocumentTicket(): Promise<void>;
}
