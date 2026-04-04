import { useState } from 'react';
import { toast } from 'sonner';
import {
  uploadImageDirectToCloudinary,
  type CloudinaryMediaContextParam,
} from '@/shared/lib/cloudinary-direct-image-upload';

// =========================================================================================
// Ảnh nhẹ: luôn Cloudinary direct (signature). Không dùng /media/upload/single (đã tắt).
// Video/PDF nặng: dùng useTicketUpload / ticket API.
// =========================================================================================

export type UploadContext = 'avatar' | 'general' | 'question' | 'cover';

export interface UploadResponse {
  url: string;
  id?: string;
}

function toCloudinaryContext(context: UploadContext): CloudinaryMediaContextParam {
  if (context === 'cover') return 'course_thumbnail';
  return context;
}

export const useMediaUpload = () => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadMedia = async (file: File, context: UploadContext): Promise<UploadResponse> => {
    setIsUploading(true);
    try {
      const { url } = await uploadImageDirectToCloudinary(file, toCloudinaryContext(context));
      return { url };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Hệ thống máy chủ ảnh đang bận. Vui lòng thử lại.';
      toast.error('Lỗi tải tệp tin', {
        description: errorMessage,
      });
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadMedia, isUploading };
};
