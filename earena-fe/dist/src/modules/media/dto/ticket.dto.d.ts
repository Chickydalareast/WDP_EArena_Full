import { MediaContext } from '../schemas/media.schema';
export declare class RequestUploadTicketDto {
    fileName: string;
    mimeType: string;
    size: number;
    context: MediaContext;
}
export declare class ConfirmUploadDto {
    mediaId: string;
}
