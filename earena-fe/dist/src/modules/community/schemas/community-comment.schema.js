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
exports.CommunityCommentSchema = exports.CommunityComment = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let CommunityComment = class CommunityComment {
    postId;
    authorId;
    parentCommentId;
    body;
    attachments;
    mentionedUserIds;
    isTeacherAnswer;
    isPinned;
    isRemoved;
    reactionCount;
    reactionBreakdown;
};
exports.CommunityComment = CommunityComment;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'CommunityPost', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], CommunityComment.prototype, "postId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], CommunityComment.prototype, "authorId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'CommunityComment', default: null, index: true }),
    __metadata("design:type", Object)
], CommunityComment.prototype, "parentCommentId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true, maxlength: 8000 }),
    __metadata("design:type", String)
], CommunityComment.prototype, "body", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [
            {
                url: { type: String, required: true },
                kind: { type: String, enum: ['IMAGE', 'FILE'], required: true },
                name: { type: String },
                mime: { type: String },
            },
        ],
        default: [],
    }),
    __metadata("design:type", Array)
], CommunityComment.prototype, "attachments", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: mongoose_2.Types.ObjectId, ref: 'User' }], default: [] }),
    __metadata("design:type", Array)
], CommunityComment.prototype, "mentionedUserIds", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], CommunityComment.prototype, "isTeacherAnswer", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], CommunityComment.prototype, "isPinned", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], CommunityComment.prototype, "isRemoved", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0, min: 0 }),
    __metadata("design:type", Number)
], CommunityComment.prototype, "reactionCount", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            HELPFUL: { type: Number, default: 0 },
            LOVE: { type: Number, default: 0 },
            QUALITY: { type: Number, default: 0 },
            SPOT_ON: { type: Number, default: 0 },
            THANKS: { type: Number, default: 0 },
        },
        default: {},
    }),
    __metadata("design:type", Object)
], CommunityComment.prototype, "reactionBreakdown", void 0);
exports.CommunityComment = CommunityComment = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'community_comments' })
], CommunityComment);
exports.CommunityCommentSchema = mongoose_1.SchemaFactory.createForClass(CommunityComment);
exports.CommunityCommentSchema.index({ postId: 1, parentCommentId: 1, createdAt: 1 });
exports.CommunityCommentSchema.index({ postId: 1, createdAt: 1 });
//# sourceMappingURL=community-comment.schema.js.map