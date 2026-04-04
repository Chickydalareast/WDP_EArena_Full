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
exports.CommunityModerationAuditSchema = exports.CommunityModerationAudit = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let CommunityModerationAudit = class CommunityModerationAudit {
    actorId;
    action;
    targetType;
    targetId;
    meta;
};
exports.CommunityModerationAudit = CommunityModerationAudit;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], CommunityModerationAudit.prototype, "actorId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], CommunityModerationAudit.prototype, "action", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], CommunityModerationAudit.prototype, "targetType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], CommunityModerationAudit.prototype, "targetId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], CommunityModerationAudit.prototype, "meta", void 0);
exports.CommunityModerationAudit = CommunityModerationAudit = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'community_moderation_audits' })
], CommunityModerationAudit);
exports.CommunityModerationAuditSchema = mongoose_1.SchemaFactory.createForClass(CommunityModerationAudit);
exports.CommunityModerationAuditSchema.index({ createdAt: -1 });
//# sourceMappingURL=community-moderation-audit.schema.js.map