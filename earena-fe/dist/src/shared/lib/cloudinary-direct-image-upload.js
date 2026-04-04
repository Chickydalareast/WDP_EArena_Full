"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImageDirectToCloudinary = uploadImageDirectToCloudinary;
const axios_client_1 = require("@/shared/lib/axios-client");
const api_endpoints_1 = require("@/config/api-endpoints");
async function uploadImageDirectToCloudinary(file, context) {
    const sigResponse = (await axios_client_1.axiosClient.get(api_endpoints_1.API_ENDPOINTS.MEDIA.SIGNATURE, {
        params: { context },
    }));
    if (!sigResponse?.apiKey ||
        !sigResponse?.signature ||
        sigResponse.timestamp == null ||
        !sigResponse?.folder ||
        !sigResponse?.cloudName) {
        throw new Error('API không trả về chữ ký upload. Hãy đăng nhập lại hoặc kiểm tra cấu hình Cloudinary trên server.');
    }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', sigResponse.apiKey);
    formData.append('timestamp', sigResponse.timestamp.toString());
    formData.append('signature', sigResponse.signature);
    formData.append('folder', sigResponse.folder);
    const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${sigResponse.cloudName}/image/upload`, { method: 'POST', body: formData });
    if (!cloudRes.ok) {
        const raw = await cloudRes.text().catch(() => '');
        let detail = raw?.slice(0, 200) || '';
        try {
            const j = JSON.parse(raw);
            if (j?.error?.message)
                detail = j.error.message;
        }
        catch {
        }
        throw new Error(detail || `Cloudinary từ chối (${cloudRes.status})`);
    }
    const cloudData = (await cloudRes.json());
    if (!cloudData.secure_url) {
        throw new Error('Cloudinary không trả về URL ảnh');
    }
    return { url: cloudData.secure_url };
}
//# sourceMappingURL=cloudinary-direct-image-upload.js.map