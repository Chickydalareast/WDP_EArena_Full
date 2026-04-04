export type UploadContext = 'avatar' | 'general' | 'question' | 'cover';
export interface UploadResponse {
    url: string;
    id?: string;
}
export declare const useMediaUpload: () => {
    uploadMedia: (file: File, context: UploadContext) => Promise<UploadResponse>;
    isUploading: any;
};
