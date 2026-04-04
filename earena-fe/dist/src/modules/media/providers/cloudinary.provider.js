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
var CloudinaryAdapter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudinaryAdapter = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const stream_1 = require("stream");
const cloudinary_1 = require("cloudinary");
let CloudinaryAdapter = CloudinaryAdapter_1 = class CloudinaryAdapter {
    configService;
    logger = new common_1.Logger(CloudinaryAdapter_1.name);
    constructor(configService) {
        this.configService = configService;
        cloudinary_1.v2.config({
            cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
            api_key: this.configService.get('CLOUDINARY_API_KEY'),
            api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
        });
    }
    generateSignature(folder) {
        const timestamp = Math.round(new Date().getTime() / 1000);
        const signature = cloudinary_1.v2.utils.api_sign_request({ timestamp, folder }, this.configService.get('CLOUDINARY_API_SECRET'));
        return {
            timestamp,
            signature,
            cloudName: this.configService.get('CLOUDINARY_CLOUD_NAME'),
            apiKey: this.configService.get('CLOUDINARY_API_KEY'),
            folder,
        };
    }
    async uploadFileLocal(filePath, folder, publicId) {
        this.logger.debug(`Đẩy file nội bộ lên Cloudinary [Folder: ${folder}]...`);
        try {
            const result = await cloudinary_1.v2.uploader.upload(filePath, {
                folder: folder,
                public_id: publicId,
                resource_type: 'auto',
            });
            return {
                url: result.secure_url,
                publicId: result.public_id,
                bytes: result.bytes,
                width: result.width,
                height: result.height,
                format: result.format,
            };
        }
        catch (error) {
            this.logger.error(`Upload file thất bại: ${error.message}`);
            throw new common_1.InternalServerErrorException('Lỗi hệ thống khi tải tài nguyên lên đám mây');
        }
    }
    async uploadImageBuffer(buffer, folder) {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary_1.v2.uploader.upload_stream({ folder, resource_type: 'image' }, (error, result) => {
                if (error) {
                    this.logger.error(`Upload buffer thất bại: ${error.message}`);
                    return reject(new common_1.InternalServerErrorException('Lỗi hệ thống khi tải ảnh bằng cấp lên đám mây'));
                }
                if (!result) {
                    return reject(new common_1.InternalServerErrorException('Cloudinary không trả về kết quả'));
                }
                resolve({
                    url: result.secure_url,
                    publicId: result.public_id,
                    bytes: result.bytes,
                    width: result.width,
                    height: result.height,
                    format: result.format,
                });
            });
            stream_1.Readable.from(buffer).pipe(uploadStream);
        });
    }
    async deleteFile(publicId, resourceType = 'image') {
        try {
            let result = await cloudinary_1.v2.uploader.destroy(publicId, {
                resource_type: resourceType,
            });
            if (result.result === 'not found' && resourceType === 'image') {
                this.logger.debug(`Không tìm thấy file dạng Image, thử quét dạng Raw: ${publicId}`);
                result = await cloudinary_1.v2.uploader.destroy(publicId, {
                    resource_type: 'raw',
                });
            }
            return result.result === 'ok';
        }
        catch (error) {
            this.logger.error(`Xóa file Cloudinary thất bại [${publicId}]: ${error.message}`);
            return false;
        }
    }
    async verifyUpload(publicId, resourceType = 'image') {
        try {
            const result = await cloudinary_1.v2.api.resource(publicId, {
                resource_type: resourceType,
            });
            return {
                url: result.secure_url,
                publicId: result.public_id,
                bytes: result.bytes,
                width: result.width,
                height: result.height,
                format: result.format,
                duration: result.duration,
            };
        }
        catch (error) {
            this.logger.error(`Lỗi kiểm toán Cloudinary [${publicId}] (Type: ${resourceType}): ${error.message}`);
            if (error.http_code === 404) {
                throw new common_1.BadRequestException(`Xác minh thất bại: Bản ghi [${publicId}] không tồn tại ở phân vùng [${resourceType}].`);
            }
            throw new common_1.InternalServerErrorException('Hệ thống giám định lưu trữ đám mây đang gặp sự cố. Vui lòng thử lại sau.');
        }
    }
    generateSignedUrl(publicId, resourceType = 'image', expiresInSeconds = 3600) {
        const expiration = Math.floor(Date.now() / 1000) + expiresInSeconds;
        return cloudinary_1.v2.url(publicId, {
            resource_type: resourceType,
            secure: true,
            sign_url: true,
            expires_at: expiration,
        });
    }
};
exports.CloudinaryAdapter = CloudinaryAdapter;
exports.CloudinaryAdapter = CloudinaryAdapter = CloudinaryAdapter_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], CloudinaryAdapter);
//# sourceMappingURL=cloudinary.provider.js.map