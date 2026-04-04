"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var GoogleDriveAdapter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleDriveAdapter = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const googleapis_1 = require("googleapis");
const gaxios_1 = require("gaxios");
let GoogleDriveAdapter = GoogleDriveAdapter_1 = class GoogleDriveAdapter {
    configService;
    logger = new common_1.Logger(GoogleDriveAdapter_1.name);
    drive;
    folderId;
    frontendOrigin;
    constructor(configService) {
        this.configService = configService;
    }
    onModuleInit() {
        const clientId = this.configService.get('PROVIDER_GOOGLE_CLIENT_ID');
        const clientSecret = this.configService.get('PROVIDER_GOOGLE_CLIENT_SECRET');
        const refreshToken = this.configService.get('PROVIDER_GOOGLE_REFRESH_TOKEN');
        this.folderId =
            this.configService.get('PROVIDER_GOOGLE_DRIVE_FOLDER_ID') || '';
        const envFrontendUrl = this.configService.get('FRONTEND_URL');
        this.frontendOrigin = envFrontendUrl || 'http://localhost:3000';
        if (!envFrontendUrl) {
            this.logger.warn(`[CORS Warning] Không tìm thấy biến FRONTEND_URL trong .env. Đang dùng fallback: ${this.frontendOrigin}. Hãy cẩn thận nếu chạy trên Production!`);
        }
        if (!clientId || !clientSecret || !refreshToken) {
            this.logger.error('[Infra Config] ❌ Thiếu biến môi trường PROVIDER_GOOGLE_... cho Google Auth!');
            return;
        }
        try {
            const oauth2Client = new googleapis_1.google.auth.OAuth2(clientId, clientSecret);
            oauth2Client.setCredentials({ refresh_token: refreshToken });
            this.drive = googleapis_1.google.drive({ version: 'v3', auth: oauth2Client });
            this.logger.log('📁 Google Drive API initialized thành công bằng OAuth2');
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`[Infra Error] ❌ Khởi tạo Google Drive API thất bại: ${errorMessage}`);
        }
    }
    async createResumableUploadSession(fileMetadata) {
        if (!this.drive) {
            this.logger.error('[GoogleDriveAdapter] Yêu cầu sinh vé upload nhưng Drive API chưa sẵn sàng.');
            throw new common_1.InternalServerErrorException('Dịch vụ lưu trữ Google Drive hiện không khả dụng.');
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
            if (!fileId)
                throw new Error('Google Drive API không trả về File ID.');
            const authClient = this.drive.context._options.auth;
            const tokenRes = await authClient.getAccessToken();
            const accessToken = tokenRes?.token;
            if (!accessToken)
                throw new Error('Không lấy được Access Token từ Google OAuth2 để cấp vé Resumable.');
            const uploadUrlRes = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=resumable`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'X-Upload-Content-Type': fileMetadata.mimeType,
                    'X-Upload-Content-Length': fileMetadata.size.toString(),
                    'Content-Type': 'application/json',
                    Origin: this.frontendOrigin,
                },
                body: JSON.stringify({ name: fileMetadata.name }),
            });
            if (!uploadUrlRes.ok) {
                throw new Error(`Resumable session API failed with status: ${uploadUrlRes.status}`);
            }
            const uploadUrl = uploadUrlRes.headers.get('location');
            if (!uploadUrl)
                throw new Error('Response từ Google không chứa Header Location (Upload URL).');
            return { uploadUrl, fileId };
        }
        catch (error) {
            if (error instanceof gaxios_1.GaxiosError) {
                const errData = error.response?.data;
                const errMsg = typeof errData === 'object' && errData !== null && 'error' in errData
                    ? String(errData.error)
                    : error.message;
                if (errMsg === 'invalid_grant') {
                    this.logger.error(`[CRITICAL INFRA ERROR] Google Refresh Token đã hết hạn/bị thu hồi (invalid_grant). Cập nhật .env ngay!`);
                    throw new common_1.InternalServerErrorException('Lỗi hệ thống: Xác thực đám mây thất bại. Vui lòng báo cáo Admin.');
                }
                this.logger.error(`[Google API Error] Lỗi sinh vé Drive: ${errMsg} - Details: ${JSON.stringify(errData)}`);
            }
            else if (error instanceof Error) {
                this.logger.error(`[GoogleDriveAdapter] Lỗi xử lý luồng sinh vé: ${error.message}`);
            }
            else {
                this.logger.error(`[GoogleDriveAdapter] Lỗi hệ thống không xác định: ${JSON.stringify(error)}`);
            }
            throw new common_1.InternalServerErrorException('Không thể khởi tạo phiên tải video do lỗi từ dịch vụ lưu trữ đám mây.');
        }
    }
    async verifyUpload(fileId) {
        if (!this.drive) {
            throw new common_1.InternalServerErrorException('Dịch vụ lưu trữ Google Drive hiện không khả dụng.');
        }
        try {
            const res = await this.drive.files.get({
                fileId: fileId,
                fields: 'id, name, mimeType, size, videoMediaMetadata',
            });
            const data = res.data;
            const durationMillis = data.videoMediaMetadata?.durationMillis;
            const durationSecs = durationMillis
                ? Math.round(parseInt(durationMillis, 10) / 1000)
                : 0;
            const previewUrl = `https://drive.google.com/file/d/${data.id}/preview`;
            return {
                url: previewUrl,
                publicId: data.id,
                bytes: parseInt(data.size || '0', 10),
                duration: durationSecs,
                format: data.mimeType ?? undefined,
            };
        }
        catch (error) {
            this.logger.error(`[GoogleDrive] Lỗi lấy metadata Video [${fileId}]: ${error.message}`);
            throw new common_1.BadRequestException('Không thể lấy metadata video. Có thể file chưa được Google xử lý xong hoặc file không tồn tại.');
        }
    }
    async deleteVideo(fileId) {
        if (!this.drive)
            return false;
        try {
            await this.drive.files.delete({ fileId });
            return true;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.warn(`[GoogleDriveAdapter] Cảnh báo: Không thể xóa file [${fileId}] trên Drive: ${errorMessage}`);
            return false;
        }
    }
};
exports.GoogleDriveAdapter = GoogleDriveAdapter;
exports.GoogleDriveAdapter = GoogleDriveAdapter = GoogleDriveAdapter_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], GoogleDriveAdapter);
//# sourceMappingURL=google-drive.provider.js.map