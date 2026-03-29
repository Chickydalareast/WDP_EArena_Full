import { useState } from 'react';
import { axiosClient } from '@/shared/lib/axios-client';
import { API_ENDPOINTS } from '@/config/api-endpoints';
import { toast } from 'sonner';

// =========================================================================================
// ⚠️ [CẢNH BÁO TỪ CTO]: HOOK NÀY LÀ LEGACY. CHỈ ĐƯỢC DÙNG CHO ẢNH NHẸ (AVATAR, THUMBNAIL).
// TUYỆT ĐỐI CẤM DÙNG CHO VIDEO HOẶC PDF VÌ SẼ BẮN TRỰC TIẾP LÊN SERVER GÂY TRÀN RAM (OOM).
// VỚI TÀI NGUYÊN NẶNG, BẮT BUỘC PHẢI DÙNG `useTicketUpload`.
// =========================================================================================

export type UploadContext = 'avatar' | 'general' | 'question' | 'cover';

export interface UploadResponse {
  url: string;
  id?: string; 
}

interface CloudinarySignatureResponse {
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  cloudName: string;
}

interface BackendUploadResponse {
  id: string;
  url: string;
}

export const useMediaUpload = () => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadMedia = async (file: File, context: UploadContext): Promise<UploadResponse> => {
    setIsUploading(true);
    try {
      if (context === 'question') {
        const sigResponse = await axiosClient.get<unknown, CloudinarySignatureResponse>(API_ENDPOINTS.MEDIA.SIGNATURE, {
          params: { context },
        });

        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', sigResponse.apiKey);
        formData.append('timestamp', sigResponse.timestamp.toString());
        formData.append('signature', sigResponse.signature);
        formData.append('folder', sigResponse.folder);

        const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${sigResponse.cloudName}/image/upload`, {
          method: 'POST',
          body: formData,
        });

        if (!cloudRes.ok) throw new Error('Cloudinary từ chối kết nối');
        const cloudData = await cloudRes.json();
        
        return { url: cloudData.secure_url };
      } 
      
      else {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('context', context);

        const response = await axiosClient.post<unknown, BackendUploadResponse>(API_ENDPOINTS.MEDIA.UPLOAD_SINGLE, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        
        return { url: response.url, id: response.id }; 
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Hệ thống máy chủ ảnh đang bận. Vui lòng thử lại.';
      toast.error('Lỗi tải tệp tin', { 
        description: errorMessage 
      });
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadMedia, isUploading };
};