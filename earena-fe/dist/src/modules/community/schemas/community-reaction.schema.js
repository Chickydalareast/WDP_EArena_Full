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
exports.CommunityReactionSchema = exports.CommunityReaction = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const community_constants_1 = require("../constants/community.constants");
let CommunityReaction = class CommunityReaction {
    userId;
    targetType;
    targetId;
    kind;
};
exports.CommunityReaction = CommunityReaction;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], CommunityReaction.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: community_constants_1.CommunityReactionTarget, required: true }),
    __metadata("design:type", String)
], CommunityReaction.prototype, "targetType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], CommunityReaction.prototype, "targetId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: community_constants_1.CommunityReactionKind, required: true }),
    __metadata("design:type", String)
], CommunityReaction.prototype, "kind", void 0);
exports.CommunityReaction = CommunityReaction = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'community_reactions' })
], CommunityReaction);
exports.CommunityReactionSchema = mongoose_1.SchemaFactory.createForClass(CommunityReaction);
exports.CommunityReactionSchema.index({ userId: 1, targetType: 1, targetId: 1 }, { unique: true });
//# sourceMappingURL=community-reaction.schema.js.map