import axios from 'axios';
import { axiosClient } from '@/shared/lib/axios-client';
import { API_ENDPOINTS } from '@/config/api-endpoints';
import {
    RequestTicketPayload,
    TicketResponse,
    ConfirmTicketPayload,
    MediaResponse,
    CloudinarySignatureResponse,
    SyncCloudinaryPayload
} from '../types/media.types';

export const mediaTicketService = {
    requestVideoTicket: async (payload: RequestTicketPayload): Promise<TicketResponse> => {
        return axiosClient.post<unknown, TicketResponse>(API_ENDPOINTS.MEDIA.VIDEO_TICKET, payload);
    },

    uploadDirectToDrive: async (
        uploadUrl: string,
        file: File,
        onProgress?: (progress: number) => void,
        cancelSignal?: AbortSignal
    ): Promise<void> => {
        await axios.put(uploadUrl, file, {
            headers: { 'Content-Type': file.type },
            signal: cancelSignal,
            onUploadProgress: (progressEvent) => {
                if (progressEvent.total && onProgress) {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(percentCompleted);
                }
            },
        });
    },

    confirmUpload: async (payload: ConfirmTicketPayload): Promise<MediaResponse> => {
        return axiosClient.post<unknown, MediaResponse>(API_ENDPOINTS.MEDIA.CONFIRM_UPLOAD, payload);
    },

    getCloudinarySignature: async (context: string): Promise<CloudinarySignatureResponse> => {
        return axiosClient.get<unknown, CloudinarySignatureResponse>(API_ENDPOINTS.MEDIA.SIGNATURE, {
            params: { context },
        });
    },

    uploadDirectToCloudinary: async (
        file: File,
        signatureData: CloudinarySignatureResponse,
        onProgress?: (progress: number) => void
    ): Promise<any> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', signatureData.apiKey);
        formData.append('timestamp', signatureData.timestamp.toString());
        formData.append('signature', signatureData.signature);
        formData.append('folder', signatureData.folder);

        const cloudRes = await axios.post(`https://api.cloudinary.com/v1_1/${signatureData.cloudName}/auto/upload`, formData, {
            onUploadProgress: (progressEvent) => {
                if (progressEvent.total && onProgress) {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(percentCompleted);
                }
            },
        });

        return cloudRes.data;
    },

    syncCloudinary: async (payload: SyncCloudinaryPayload): Promise<MediaResponse> => {
        return axiosClient.post<unknown, MediaResponse>(API_ENDPOINTS.MEDIA.SYNC_CLOUDINARY, payload);
    }
};