import { useState } from 'react';
import { toast } from 'sonner';
import { mediaTicketService } from '../api/media-ticket.service';
import { parseApiError } from '@/shared/lib/error-parser';
import { MediaContextType, MediaResponse } from '../types/media.types';

type ProviderType = 'VIDEO'; 

export const useTicketUpload = () => {
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [progress, setProgress] = useState<number>(0);

    const uploadWithTicket = async (
        file: File,
        providerType: ProviderType,
        context: MediaContextType
    ): Promise<MediaResponse> => {
        setIsUploading(true);
        setProgress(0);

        try {
            const ticketPayload = {
                fileName: file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_'),
                mimeType: file.type,
                size: file.size,
                context,
            };

            const { mediaId, uploadUrl } = await mediaTicketService.requestVideoTicket(ticketPayload);

            setProgress(5);
            await mediaTicketService.uploadDirectToDrive(uploadUrl, file, (percent) => {
                setProgress(5 + Math.round(percent * 0.9));
            });

            setProgress(95);
            const finalMedia = await mediaTicketService.confirmUpload({ mediaId });

            setProgress(100);
            return finalMedia;

        } catch (error: unknown) {
            const parsedError = parseApiError(error);
            toast.error('Lỗi tải video bài giảng', {
                description: parsedError.message || 'Máy chủ Google Drive từ chối kết nối. Vui lòng thử lại.'
            });
            throw error;
        } finally {
            setIsUploading(false);
            setTimeout(() => setProgress(0), 1000);
        }
    };

    return {
        uploadWithTicket,
        isUploading,
        progress
    };
};