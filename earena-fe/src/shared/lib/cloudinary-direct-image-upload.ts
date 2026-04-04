import { axiosClient } from '@/shared/lib/axios-client';
import { API_ENDPOINTS } from '@/config/api-endpoints';

/** Khớp `MediaContext` trên server (query `?context=`). */
export type CloudinaryMediaContextParam =
  | 'avatar'
  | 'general'
  | 'question'
  | 'course_thumbnail'
  | 'lesson_document'
  | 'lesson_video';

interface CloudinarySignatureResponse {
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  cloudName: string;
}

/**
 * Ảnh: lấy signature từ BE rồi POST trực tiếp lên Cloudinary.
 * Endpoint `/media/upload/single` đã ngừng hỗ trợ — mọi ảnh nhẹ dùng luồng này.
 */
export async function uploadImageDirectToCloudinary(
  file: File,
  context: CloudinaryMediaContextParam,
): Promise<{ url: string }> {
  const sigResponse = (await axiosClient.get(API_ENDPOINTS.MEDIA.SIGNATURE, {
    params: { context },
  })) as CloudinarySignatureResponse;

  if (
    !sigResponse?.apiKey ||
    !sigResponse?.signature ||
    sigResponse.timestamp == null ||
    !sigResponse?.folder ||
    !sigResponse?.cloudName
  ) {
    throw new Error(
      'API không trả về chữ ký upload. Hãy đăng nhập lại hoặc kiểm tra cấu hình Cloudinary trên server.',
    );
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', sigResponse.apiKey);
  formData.append('timestamp', sigResponse.timestamp.toString());
  formData.append('signature', sigResponse.signature);
  formData.append('folder', sigResponse.folder);

  const cloudRes = await fetch(
    `https://api.cloudinary.com/v1_1/${sigResponse.cloudName}/image/upload`,
    { method: 'POST', body: formData },
  );

  if (!cloudRes.ok) {
    const raw = await cloudRes.text().catch(() => '');
    let detail = raw?.slice(0, 200) || '';
    try {
      const j = JSON.parse(raw) as { error?: { message?: string } };
      if (j?.error?.message) detail = j.error.message;
    } catch {
      /* giữ raw */
    }
    throw new Error(detail || `Cloudinary từ chối (${cloudRes.status})`);
  }

  const cloudData = (await cloudRes.json()) as { secure_url?: string };
  if (!cloudData.secure_url) {
    throw new Error('Cloudinary không trả về URL ảnh');
  }

  return { url: cloudData.secure_url };
}
