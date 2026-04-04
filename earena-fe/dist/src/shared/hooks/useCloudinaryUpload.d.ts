import { MediaContextType, MediaResponse } from '../types/media.types';
export declare const useCloudinaryUpload: () => {
    uploadDirectly: (file: File, context: MediaContextType) => Promise<MediaResponse>;
    isUploading: any;
    progress: any;
};
