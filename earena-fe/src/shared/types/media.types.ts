export type MediaContextType =
    | 'avatar'
    | 'course_thumbnail'
    | 'lesson_video'
    | 'lesson_document'
    | 'question'
    | 'general'
    | 'course_promotional_video';

export interface RequestTicketPayload {
    fileName: string;
    mimeType: string;
    size: number;
    context: MediaContextType;
}

export interface TicketResponse {
    mediaId: string;
    uploadUrl: string;
}

export interface ConfirmTicketPayload {
    mediaId: string;
}

export interface MediaResponse {
    id: string;
    url: string;
    blurHash: string | null;
    originalName: string;
    context: string;
    duration?: number;
    size?: number;
}

export interface CloudinarySignatureResponse {
    apiKey: string;
    timestamp: number;
    signature: string;
    folder: string;
    cloudName: string;
}

export interface SyncCloudinaryPayload {
    publicId: string;
    format: string;
    bytes: number;
    originalName: string;
    context: MediaContextType;
}