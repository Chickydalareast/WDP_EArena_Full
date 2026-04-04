"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const bullmq_1 = require("@nestjs/bullmq");
const media_controller_1 = require("./media.controller");
const media_service_1 = require("./media.service");
const media_processor_1 = require("./media.processor");
const cloudinary_provider_1 = require("./providers/cloudinary.provider");
const google_drive_provider_1 = require("./providers/google-drive.provider");
const storage_provider_interface_1 = require("./interfaces/storage-provider.interface");
const media_schema_1 = require("./schemas/media.schema");
const media_repository_1 = require("./media.repository");
let MediaModule = class MediaModule {
};
exports.MediaModule = MediaModule;
exports.MediaModule = MediaModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: media_schema_1.Media.name, schema: media_schema_1.MediaSchema }]),
            bullmq_1.BullModule.registerQueue({
                name: 'media',
            }),
        ],
        controllers: [media_controller_1.MediaController],
        providers: [
            media_service_1.MediaService,
            media_processor_1.MediaProcessor,
            media_repository_1.MediaRepository,
            { provide: storage_provider_interface_1.CLOUDINARY_PROVIDER, useClass: cloudinary_provider_1.CloudinaryAdapter },
            { provide: storage_provider_interface_1.VIDEO_PROVIDER, useClass: google_drive_provider_1.GoogleDriveAdapter },
        ],
        exports: [media_service_1.MediaService, media_repository_1.MediaRepository, storage_provider_interface_1.CLOUDINARY_PROVIDER],
    })
], MediaModule);
//# sourceMappingURL=media.module.js.map