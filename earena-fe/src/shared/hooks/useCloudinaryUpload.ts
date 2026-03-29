import { useState } from 'react';
import { toast } from 'sonner';
import { mediaTicketService } from '../api/media-ticket.service';
import { parseApiError } from '@/shared/lib/error-parser';
import { MediaContextType, MediaResponse } from '../types/media.types';

export const useCloudinaryUpload = () => {
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [progress, setProgress] = useState<number>(0);

    const uploadDirectly = async (
        file: File,
        context: MediaContextType
    ): Promise<MediaResponse> => {
        setIsUploading(true);
        setProgress(0);

        try {
            setProgress(5);
            const signatureData = await mediaTicketService.getCloudinarySignature(context);

            const cloudData = await mediaTicketService.uploadDirectToCloudinary(
                file, 
                signatureData, 
                (percent) => {
                    setProgress(5 + Math.round(percent * 0.85));
                }
            );

            setProgress(95);
            const syncPayload = {
                publicId: cloudData.public_id,
                format: cloudData.format || file.name.split('.').pop() || 'unknown',
                bytes: cloudData.bytes,
                originalName: file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_'),
                context: context,
            };

            const finalMedia = await mediaTicketService.syncCloudinary(syncPayload);

            setProgress(100);
            return finalMedia;

        } catch (error: unknown) {
            const parsedError = parseApiError(error);
            toast.error('Tải lên đám mây thất bại', {
                description: parsedError.message || 'Quá trình tải tài liệu/hình ảnh bị gián đoạn. Vui lòng thử lại.'
            });
            throw error;
        } finally {
            setIsUploading(false);
            setTimeout(() => setProgress(0), 1000);
        }
    };

    return {
        uploadDirectly,
        isUploading,
        progress
    };
};