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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var MediaProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const sharp_1 = __importDefault(require("sharp"));
const blurhash_1 = require("blurhash");
const media_repository_1 = require("./media.repository");
let MediaProcessor = MediaProcessor_1 = class MediaProcessor extends bullmq_1.WorkerHost {
    mediaRepository;
    logger = new common_1.Logger(MediaProcessor_1.name);
    IMAGE_EXT_REGEX = /\.(jpg|jpeg|png|webp|heic)(\?.*)?$/i;
    constructor(mediaRepository) {
        super();
        this.mediaRepository = mediaRepository;
    }
    async process(job) {
        switch (job.name) {
            case 'generate-blurhash':
                await this.handleGenerateBlurhash(job);
                break;
            default:
                this.logger.warn(`[Worker] Bỏ qua job không xác định định tuyến: ${job.name}`);
        }
    }
    async handleGenerateBlurhash(job) {
        const { mediaId, url } = job.data;
        this.logger.debug(`[Worker] Đang xử lý Blurhash cho Media ID: ${mediaId}`);
        if (!this.IMAGE_EXT_REGEX.test(url) || !url.includes('cloudinary')) {
            this.logger.warn(`[Worker] Cảnh báo: URL không hợp lệ cho Blurhash. Hủy bỏ tác vụ ẩn. URL: ${url}`);
            return;
        }
        try {
            const microUrl = url.replace(/\/upload\/(v\d+\/)?/, '/upload/w_32,h_32,c_scale/$1');
            const response = await fetch(microUrl);
            if (!response.ok) {
                if (response.status >= 400 && response.status < 500) {
                    this.logger.error(`[Worker] Cảnh báo từ CDN (Status: ${response.status}). URL bị lỗi, ngừng Retry.`);
                    return;
                }
                throw new Error(`Fetch CDN thất bại với status HTTP: ${response.status}`);
            }
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const { data: pixels, info } = await (0, sharp_1.default)(buffer)
                .raw()
                .ensureAlpha()
                .toBuffer({ resolveWithObject: true });
            const blurHash = (0, blurhash_1.encode)(new Uint8ClampedArray(pixels), info.width, info.height, 4, 4);
            await this.mediaRepository.updateByIdSafe(mediaId, {
                $set: { blurHash },
            });
            this.logger.log(`✅ [Worker] Tạo Blurhash thành công cho Media ID: ${mediaId}`);
        }
        catch (error) {
            this.logger.error(`❌ [Worker] Lỗi System Blurhash [${mediaId}]: ${error.message}`);
            throw error;
        }
    }
};
exports.MediaProcessor = MediaProcessor;
exports.MediaProcessor = MediaProcessor = MediaProcessor_1 = __decorate([
    (0, bullmq_1.Processor)('media'),
    __metadata("design:paramtypes", [media_repository_1.MediaRepository])
], MediaProcessor);
//# sourceMappingURL=media.processor.js.map