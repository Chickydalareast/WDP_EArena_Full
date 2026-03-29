import { BadRequestException, Injectable, InternalServerErrorException, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google, drive_v3 } from 'googleapis';
import { GaxiosError } from 'gaxios'; // Import chuẩn type lỗi của Google API
import type { IVideoProvider, StorageMetadata } from '../interfaces/storage-provider.interface';

@Injectable()
export class GoogleDriveAdapter implements IVideoProvider, OnModuleInit {
    private readonly logger = new Logger(GoogleDriveAdapter.name);
    private drive: drive_v3.Drive;
    private folderId: string;
    private frontendOrigin: string; // [CTO UPGRADE]: Caching cấu hình CORS Origin

    constructor(private readonly configService: ConfigService) {}

    onModuleInit(): void {
        const clientId = this.configService.get<string>('PROVIDER_GOOGLE_CLIENT_ID');
        const clientSecret = this.configService.get<string>('PROVIDER_GOOGLE_CLIENT_SECRET');
        const refreshToken = this.configService.get<string>('PROVIDER_GOOGLE_REFRESH_TOKEN');
        
        this.folderId = this.configService.get<string>('PROVIDER_GOOGLE_DRIVE_FOLDER_ID') || '';
        
        // [CTO UPGRADE]: Nạp Frontend URL 1 lần duy nhất lúc khởi động để tăng hiệu năng
        const envFrontendUrl = this.configService.get<string>('FRONTEND_URL');
        this.frontendOrigin = envFrontendUrl || 'http://localhost:3000';

        if (!envFrontendUrl) {
            this.logger.warn(`[CORS Warning] Không tìm thấy biến FRONTEND_URL trong .env. Đang dùng fallback: ${this.frontendOrigin}. Hãy cẩn thận nếu chạy trên Production!`);
        }

        if (!clientId || !clientSecret || !refreshToken) {
            this.logger.error('[Infra Config] ❌ Thiếu biến môi trường PROVIDER_GOOGLE_... cho Google Auth!');
            return;
        }

        try {
            const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
            oauth2Client.setCredentials({ refresh_token: refreshToken });

            this.drive = google.drive({ version: 'v3', auth: oauth2Client });
            this.logger.log('📁 Google Drive API initialized thành công bằng OAuth2');
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`[Infra Error] ❌ Khởi tạo Google Drive API thất bại: ${errorMessage}`);
        }
    }

    async createResumableUploadSession(fileMetadata: { name: string; mimeType: string; size: number }): Promise<{ uploadUrl: string; fileId: string }> {
        // [GUARD CLAUSE]: Ngăn chặn crash app nếu Drive chưa được khởi tạo thành công
        if (!this.drive) {
            this.logger.error('[GoogleDriveAdapter] Yêu cầu sinh vé upload nhưng Drive API chưa sẵn sàng.');
            throw new InternalServerErrorException('Dịch vụ lưu trữ Google Drive hiện không khả dụng.');
        }

        try {
            const res = await this.drive.files.create({
                requestBody: {
                    name: fileMetadata.name,
                    mimeType: fileMetadata.mimeType,
                    ...(this.folderId ? { parents: [this.folderId] } : {}),
                },
                media: {
                    mimeType: fileMetadata.mimeType,
                },
                fields: 'id',
            });

            const fileId = res.data.id;
            if (!fileId) throw new Error('Google Drive API không trả về File ID.');

            // Lấy Access Token an toàn từ OAuth2 Client
            const authClient = this.drive.context._options.auth as any;
            const tokenRes = await authClient.getAccessToken();
            const accessToken = tokenRes?.token;

            if (!accessToken) throw new Error('Không lấy được Access Token từ Google OAuth2 để cấp vé Resumable.');

            // [CTO FIX]: Tích hợp CORS Header 'Origin' sử dụng biến đã cached
            const uploadUrlRes = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=resumable`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'X-Upload-Content-Type': fileMetadata.mimeType,
                    'X-Upload-Content-Length': fileMetadata.size.toString(),
                    'Content-Type': 'application/json',
                    'Origin': this.frontendOrigin, // 🚀 CHÌA KHÓA MỞ CỬA CORS CHO FRONTEND
                },
                body: JSON.stringify({ name: fileMetadata.name })
            });

            if (!uploadUrlRes.ok) {
                throw new Error(`Resumable session API failed with status: ${uploadUrlRes.status}`);
            }

            const uploadUrl = uploadUrlRes.headers.get('location');
            if (!uploadUrl) throw new Error('Response từ Google không chứa Header Location (Upload URL).');

            return { uploadUrl, fileId };

        } catch (error: unknown) {
            if (error instanceof GaxiosError) {
                const errData = error.response?.data;
                const errMsg = typeof errData === 'object' && errData !== null && 'error' in errData 
                                ? String(errData.error) 
                                : error.message;

                if (errMsg === 'invalid_grant') {
                    this.logger.error(`[CRITICAL INFRA ERROR] Google Refresh Token đã hết hạn/bị thu hồi (invalid_grant). Cập nhật .env ngay!`);
                    throw new InternalServerErrorException('Lỗi hệ thống: Xác thực đám mây thất bại. Vui lòng báo cáo Admin.');
                }
                
                this.logger.error(`[Google API Error] Lỗi sinh vé Drive: ${errMsg} - Details: ${JSON.stringify(errData)}`);
            } else if (error instanceof Error) {
                this.logger.error(`[GoogleDriveAdapter] Lỗi xử lý luồng sinh vé: ${error.message}`);
            } else {
                this.logger.error(`[GoogleDriveAdapter] Lỗi hệ thống không xác định: ${JSON.stringify(error)}`);
            }

            throw new InternalServerErrorException('Không thể khởi tạo phiên tải video do lỗi từ dịch vụ lưu trữ đám mây.');
        }
    }

    async verifyUpload(fileId: string): Promise<StorageMetadata> {
        if (!this.drive) {
            throw new InternalServerErrorException('Dịch vụ lưu trữ Google Drive hiện không khả dụng.');
        }

        try {
            const res = await this.drive.files.get({
                fileId: fileId,
                fields: 'id, name, mimeType, size, videoMediaMetadata',
            });

            const data = res.data;
            const durationMillis = data.videoMediaMetadata?.durationMillis;
            const durationSecs = durationMillis ? Math.round(parseInt(durationMillis, 10) / 1000) : 0;

            const previewUrl = `https://drive.google.com/file/d/${data.id}/preview`;

            return {
                url: previewUrl, 
                publicId: data.id!, 
                bytes: parseInt(data.size || '0', 10),
                duration: durationSecs,
                format: data.mimeType ?? undefined,
            };
        } catch (error: any) {
            this.logger.error(`[GoogleDrive] Lỗi lấy metadata Video [${fileId}]: ${error.message}`);
            throw new BadRequestException('Không thể lấy metadata video. Có thể file chưa được Google xử lý xong hoặc file không tồn tại.');
        }
    }

    async deleteVideo(fileId: string): Promise<boolean> {
        if (!this.drive) return false;

        try {
            await this.drive.files.delete({ fileId });
            return true;
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.warn(`[GoogleDriveAdapter] Cảnh báo: Không thể xóa file [${fileId}] trên Drive: ${errorMessage}`);
            return false;
        }
    }
}