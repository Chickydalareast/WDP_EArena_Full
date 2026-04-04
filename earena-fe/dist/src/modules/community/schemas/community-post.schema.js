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
exports.CommunityPostSchema = exports.CommunityPost = exports.CommunityCourseSnapshot = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const community_constants_1 = require("../constants/community.constants");
let CommunityCourseSnapshot = class CommunityCourseSnapshot {
    courseId;
    title;
    slug;
    coverUrl;
    price;
    discountPrice;
    teacherName;
    teacherId;
    averageRating;
    totalReviews;
};
exports.CommunityCourseSnapshot = CommunityCourseSnapshot;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], CommunityCourseSnapshot.prototype, "courseId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], CommunityCourseSnapshot.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true, index: true }),
    __metadata("design:type", String)
], CommunityCourseSnapshot.prototype, "slug", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], CommunityCourseSnapshot.prototype, "coverUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], CommunityCourseSnapshot.prototype, "price", void 0);
__decorate([
    (0, mongoose_1.Prop)({ min: 0 }),
    __metadata("design:type", Number)
], CommunityCourseSnapshot.prototype, "discountPrice", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], CommunityCourseSnapshot.prototype, "teacherName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], CommunityCourseSnapshot.prototype, "teacherId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0, max: 5, default: 0 }),
    __metadata("design:type", Number)
], CommunityCourseSnapshot.prototype, "averageRating", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0, default: 0 }),
    __metadata("design:type", Number)
], CommunityCourseSnapshot.prototype, "totalReviews", void 0);
exports.CommunityCourseSnapshot = CommunityCourseSnapshot = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], CommunityCourseSnapshot);
const CommunityCourseSnapshotSchema = mongoose_1.SchemaFactory.createForClass(CommunityCourseSnapshot);
let CommunityPost = class CommunityPost {
    authorId;
    type;
    status;
    bodyJson;
    bodyPlain;
    attachments;
    tags;
    subjectId;
    courseId;
    examId;
    courseSnapshot;
    commentCount;
    reactionCount;
    saveCount;
    reactionBreakdown;
    hotScore;
    bestAnswerCommentId;
    pinnedCommentId;
    isFeatured;
    commentsLocked;
};
exports.CommunityPost = CommunityPost;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], CommunityPost.prototype, "authorId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: community_constants_1.CommunityPostType, required: true, index: true }),
    __metadata("design:type", String)
], CommunityPost.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: community_constants_1.CommunityPostStatus, default: community_constants_1.CommunityPostStatus.ACTIVE, index: true }),
    __metadata("design:type", String)
], CommunityPost.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], CommunityPost.prototype, "bodyJson", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], CommunityPost.prototype, "bodyPlain", void 0);
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
], CommunityPost.prototype, "attachments", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], CommunityPost.prototype, "tags", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Subject', index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], CommunityPost.prototype, "subjectId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Course', index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], CommunityPost.prototype, "courseId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Exam', index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], CommunityPost.prototype, "examId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: CommunityCourseSnapshotSchema }),
    __metadata("design:type", CommunityCourseSnapshot)
], CommunityPost.prototype, "courseSnapshot", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0, min: 0 }),
    __metadata("design:type", Number)
], CommunityPost.prototype, "commentCount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0, min: 0 }),
    __metadata("design:type", Number)
], CommunityPost.prototype, "reactionCount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0, min: 0 }),
    __metadata("design:type", Number)
], CommunityPost.prototype, "saveCount", void 0);
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
], CommunityPost.prototype, "reactionBreakdown", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], CommunityPost.prototype, "hotScore", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'CommunityComment', default: null }),
    __metadata("design:type", Object)
], CommunityPost.prototype, "bestAnswerCommentId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'CommunityComment', default: null }),
    __metadata("design:type", Object)
], CommunityPost.prototype, "pinnedCommentId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false, index: true }),
    __metadata("design:type", Boolean)
], CommunityPost.prototype, "isFeatured", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], CommunityPost.prototype, "commentsLocked", void 0);
exports.CommunityPost = CommunityPost = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'community_posts' })
], CommunityPost);
exports.CommunityPostSchema = mongoose_1.SchemaFactory.createForClass(CommunityPost);
exports.CommunityPostSchema.index({ status: 1, createdAt: -1 });
exports.CommunityPostSchema.index({ status: 1, subjectId: 1, createdAt: -1 });
exports.CommunityPostSchema.index({ status: 1, type: 1, createdAt: -1 });
exports.CommunityPostSchema.index({ status: 1, courseId: 1, createdAt: -1 });
exports.CommunityPostSchema.index({ status: 1, examId: 1, createdAt: -1 });
exports.CommunityPostSchema.index({ status: 1, hotScore: -1, createdAt: -1 });
exports.CommunityPostSchema.index({ authorId: 1, status: 1, createdAt: -1 });
exports.CommunityPostSchema.index({ bodyPlain: 'text', tags: 'text' });
//# sourceMappingURL=community-post.schema.js.map