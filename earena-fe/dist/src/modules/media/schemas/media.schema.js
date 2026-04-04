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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaSchema = exports.Media = exports.MediaStatus = exports.MediaProvider = exports.MediaContext = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var MediaContext;
(function (MediaContext) {
    MediaContext["AVATAR"] = "avatar";
    MediaContext["COURSE_THUMBNAIL"] = "course_thumbnail";
    MediaContext["LESSON_VIDEO"] = "lesson_video";
    MediaContext["LESSON_DOCUMENT"] = "lesson_document";
    MediaContext["QUESTION"] = "question";
    MediaContext["GENERAL"] = "general";
})(MediaContext || (exports.MediaContext = MediaContext = {}));
var MediaProvider;
(function (MediaProvider) {
    MediaProvider["CLOUDINARY"] = "CLOUDINARY";
    MediaProvider["GOOGLE_DRIVE"] = "GOOGLE_DRIVE";
    MediaProvider["YOUTUBE"] = "YOUTUBE";
    MediaProvider["FIREBASE"] = "FIREBASE";
})(MediaProvider || (exports.MediaProvider = MediaProvider = {}));
var MediaStatus;
(function (MediaStatus) {
    MediaStatus["PENDING"] = "PENDING";
    MediaStatus["PROCESSING"] = "PROCESSING";
    MediaStatus["READY"] = "READY";
    MediaStatus["FAILED"] = "FAILED";
})(MediaStatus || (exports.MediaStatus = MediaStatus = {}));
let Media = class Media {
    originalName;
    publicId;
    url;
    provider;
    status;
    mimetype;
    size;
    width;
    height;
    blurHash;
    duration;
    uploadedBy;
    context;
};
exports.Media = Media;
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], Media.prototype, "originalName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true, index: true }),
    __metadata("design:type", String)
], Media.prototype, "publicId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Media.prototype, "url", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: MediaProvider, index: true }),
    __metadata("design:type", String)
], Media.prototype, "provider", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        enum: MediaStatus,
        default: MediaStatus.READY,
        index: true,
    }),
    __metadata("design:type", String)
], Media.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Media.prototype, "mimetype", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Media.prototype, "size", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", Number)
], Media.prototype, "width", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", Number)
], Media.prototype, "height", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: null }),
    __metadata("design:type", String)
], Media.prototype, "blurHash", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", Number)
], Media.prototype, "duration", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Media.prototype, "uploadedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: MediaContext,
        default: MediaContext.GENERAL,
        index: true,
    }),
    __metadata("design:type", String)
], Media.prototype, "context", void 0);
exports.Media = Media = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'media' })
], Media);
exports.MediaSchema = mongoose_1.SchemaFactory.createForClass(Media);
exports.MediaSchema.index({ status: 1, createdAt: 1 });
//# sourceMappingURL=media.schema.js.map