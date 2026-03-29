import { Logger } from '@nestjs/common';
// ❌ Đã xóa các import liên quan đến Interface cũ gây lỗi TS2305
// import * as admin from 'firebase-admin';

/**
 * @deprecated [CTO WARNING] TỆP TIN NÀY LÀ TÀN DƯ KHÔNG SỬ DỤNG (ZOMBIE CODE).
 * Toàn bộ luồng Upload Document đã được chuyển sang Cloudinary (Direct Signature).
 * Giữ lại file này chỉ để làm "Bảo tàng code" tham khảo cấu hình Firebase cũ.
 * Tuyệt đối không import class này vào bất kỳ Module nào để tránh sập hệ thống.
 */
// @Injectable() // [MAX PING]: Comment out Injectable để NestJS hoàn toàn phớt lờ class này
export class FirebaseAdapter {
    private readonly logger = new Logger('FirebaseAdapter_Legacy');

    constructor() {
        this.logger.warn('Class FirebaseAdapter đã bị đóng băng. Luồng code này sẽ không bao giờ được chạy.');
    }

    /* ====================================================================
       [DĨ HÒA VI QUÝ] - TOÀN BỘ LOGIC CŨ ĐÃ ĐƯỢC ĐÓNG GÓI CHỜ XÓA
       ====================================================================
    
    private bucket: any;

    onModuleInit() {
        // Logic nạp credential từ JSON...
    }

    async generateUploadUrl(fileName: string, mimeType: string) {
        // Sinh vé Signed URL...
    }

    async generateSignedReadUrl(filePath: string, expiresInMinutes: number) {
        // Đọc file bảo mật...
    }

    async deleteDocument(filePath: string) {
        // Xóa document...
    }

    async verifyUpload(filePath: string) {
        // Lấy metadata...
    }
    ==================================================================== */
}