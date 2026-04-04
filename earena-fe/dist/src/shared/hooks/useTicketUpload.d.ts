import { MediaContextType, MediaResponse } from '../types/media.types';
type ProviderType = 'VIDEO';
export declare const useTicketUpload: () => {
    uploadWithTicket: (file: File, providerType: ProviderType, context: MediaContextType) => Promise<MediaResponse>;
    isUploading: any;
    progress: any;
};
export {};
