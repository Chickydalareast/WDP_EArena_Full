import { RequestTicketPayload, TicketResponse, ConfirmTicketPayload, MediaResponse, CloudinarySignatureResponse, SyncCloudinaryPayload } from '../types/media.types';
export declare const mediaTicketService: {
    requestVideoTicket: (payload: RequestTicketPayload) => Promise<TicketResponse>;
    uploadDirectToDrive: (uploadUrl: string, file: File, onProgress?: (progress: number) => void, cancelSignal?: AbortSignal) => Promise<void>;
    confirmUpload: (payload: ConfirmTicketPayload) => Promise<MediaResponse>;
    getCloudinarySignature: (context: string) => Promise<CloudinarySignatureResponse>;
    uploadDirectToCloudinary: (file: File, signatureData: CloudinarySignatureResponse, onProgress?: (progress: number) => void) => Promise<any>;
    syncCloudinary: (payload: SyncCloudinaryPayload) => Promise<MediaResponse>;
};
