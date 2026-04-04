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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunityController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const optional_auth_decorator_1 = require("../../common/decorators/optional-auth.decorator");
const rate_limit_decorator_1 = require("../../common/decorators/rate-limit.decorator");
const community_service_1 = require("./community.service");
const create_community_post_dto_1 = require("./dto/create-community-post.dto");
const community_feed_query_dto_1 = require("./dto/community-feed-query.dto");
const community_comment_dto_1 = require("./dto/community-comment.dto");
const community_react_dto_1 = require("./dto/community-react.dto");
const community_report_dto_1 = require("./dto/community-report.dto");
const community_follow_dto_1 = require("./dto/community-follow.dto");
const community_constants_1 = require("./constants/community.constants");
const community_id_body_dto_1 = require("./dto/community-id-body.dto");
let CommunityController = class CommunityController {
    communityService;
    constructor(communityService) {
        this.communityService = communityService;
    }
    actor(user) {
        return {
            userId: user.userId,
            role: user.role,
            email: user.email,
            teacherVerificationStatus: user.teacherVerificationStatus,
        };
    }
    async feed(query, userId) {
        const data = await this.communityService.getFeed(query, userId);
        return { message: 'OK', data };
    }
    async sidebar(userId) {
        const data = await this.communityService.sidebar(userId);
        return { message: 'OK', data };
    }
    async recommended(userId, limit) {
        const data = await this.communityService.getRecommended(userId, limit || 20);
        return { message: 'OK', data };
    }
    async postsByCourse(courseId, cursor, limit, userId) {
        const data = await this.communityService.listPostsByCourse(courseId, userId, cursor, limit || 20);
        return { message: 'OK', data };
    }
    async getPost(postId, userId) {
        const data = await this.communityService.getPostById(postId, userId);
        return { message: 'OK', data };
    }
    async listComments(postId, userId) {
        const data = await this.communityService.listComments(postId, userId);
        return { message: 'OK', data };
    }
    async profile(userId, viewerId) {
        const data = await this.communityService.getProfile(userId, viewerId);
        return { message: 'OK', data };
    }
    async uploadPostImage(userId, file) {
        const data = await this.communityService.uploadAttachmentImage(userId, file);
        return { message: 'Tải ảnh thành công', data };
    }
    async createPost(user, dto) {
        const data = await this.communityService.createPost(this.actor(user), dto);
        return { message: 'Đã đăng bài', data };
    }
    async updatePost(user, postId, dto) {
        const data = await this.communityService.updatePost(this.actor(user), postId, dto);
        return { message: 'Đã cập nhật', data };
    }
    async deletePost(user, postId) {
        const data = await this.communityService.deletePost(this.actor(user), postId);
        return { message: 'Đã xóa', data };
    }
    async savePost(user, postId) {
        const data = await this.communityService.savePost(this.actor(user), postId);
        return { message: 'OK', data };
    }
    async unsavePost(user, postId) {
        const data = await this.communityService.unsavePost(this.actor(user), postId);
        return { message: 'OK', data };
    }
    async saved(user, cursor, limit) {
        const data = await this.communityService.listSaved(this.actor(user), cursor, limit || 20);
        return { message: 'OK', data };
    }
    async reactPost(user, postId, dto) {
        const data = await this.communityService.setPostReaction(this.actor(user), postId, dto.kind);
        return { message: 'OK', data };
    }
    async unreactPost(user, postId) {
        const data = await this.communityService.removePostReaction(this.actor(user), postId);
        return { message: 'OK', data };
    }
    async createComment(user, postId, dto) {
        const data = await this.communityService.createComment(this.actor(user), postId, dto);
        return { message: 'Đã gửi bình luận', data };
    }
    async updateComment(user, commentId, dto) {
        const data = await this.communityService.updateComment(this.actor(user), commentId, dto);
        return { message: 'Đã cập nhật', data };
    }
    async deleteComment(user, commentId) {
        const data = await this.communityService.deleteComment(this.actor(user), commentId);
        return { message: 'OK', data };
    }
    async reactComment(user, commentId, dto) {
        const data = await this.communityService.setCommentReaction(this.actor(user), commentId, dto.kind);
        return { message: 'OK', data };
    }
    async unreactComment(user, commentId) {
        const data = await this.communityService.removeCommentReaction(this.actor(user), commentId);
        return { message: 'OK', data };
    }
    async bestAnswer(user, postId, body) {
        const data = await this.communityService.setBestAnswer(this.actor(user), postId, body.commentId);
        return { message: 'OK', data };
    }
    async pinComment(user, postId, body) {
        const data = await this.communityService.pinComment(this.actor(user), postId, body.commentId);
        return { message: 'OK', data };
    }
    async unpinComment(user, postId) {
        const data = await this.communityService.unpinComment(this.actor(user), postId);
        return { message: 'OK', data };
    }
    async report(user, dto) {
        const data = await this.communityService.createReport(this.actor(user), dto);
        return { message: 'Đã gửi báo cáo', data };
    }
    async follow(user, dto) {
        const data = await this.communityService.follow(this.actor(user), dto.targetType, dto.targetId);
        return { message: 'OK', data };
    }
    async unfollow(user, targetType, targetId) {
        const data = await this.communityService.unfollow(this.actor(user), targetType, targetId);
        return { message: 'OK', data };
    }
    async following(user) {
        const data = await this.communityService.listFollowing(this.actor(user));
        return { message: 'OK', data };
    }
    async block(user, blockedUserId) {
        const data = await this.communityService.blockUser(this.actor(user), blockedUserId);
        return { message: 'OK', data };
    }
    async unblock(user, blockedUserId) {
        const data = await this.communityService.unblockUser(this.actor(user), blockedUserId);
        return { message: 'OK', data };
    }
};
exports.CommunityController = CommunityController;
__decorate([
    (0, optional_auth_decorator_1.OptionalAuth)(),
    (0, common_1.Get)('feed'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [community_feed_query_dto_1.CommunityFeedQueryDto, Object]),
    __metadata("design:returntype", Promise)
], CommunityController.prototype, "feed", null);
__decorate([
    (0, optional_auth_decorator_1.OptionalAuth)(),
    (0, common_1.Get)('sidebar'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CommunityController.prototype, "sidebar", null);
__decorate([
    (0, common_1.Get)('recommended'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], CommunityController.prototype, "recommended", null);
__decorate([
    (0, optional_auth_decorator_1.OptionalAuth)(),
    (0, common_1.Get)('posts/course/:courseId'),
    __param(0, (0, common_1.Param)('courseId')),
    __param(1, (0, common_1.Query)('cursor')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Object]),
    __metadata("design:returntype", Promise)
], CommunityController.prototype, "postsByCourse", null);
__decorate([
    (0, optional_auth_decorator_1.OptionalAuth)(),
    (0, common_1.Get)('posts/:postId'),
    __param(0, (0, common_1.Param)('postId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CommunityController.prototype, "getPost", null);
__decorate([
    (0, optional_auth_decorator_1.OptionalAuth)(),
    (0, common_1.Get)('posts/:postId/comments'),
    __param(0, (0, common_1.Param)('postId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CommunityController.prototype, "listComments", null);
__decorate([
    (0, optional_auth_decorator_1.OptionalAuth)(),
    (0, common_1.Get)('profile/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CommunityController.prototype, "profile", null);
__decorate([
    (0, rate_limit_decorator_1.RateLimit)({ points: 40, duration: 60 }),
    (0, common_1.Post)('upload/image'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.memoryStorage)(),
        limits: { fileSize: 8 * 1024 * 1024 },
    })),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(1, (0, common_1.UploadedFile)(new common_1.ParseFilePipe({
        validators: [new common_1.MaxFileSizeValidator({ maxSize: 8 * 1024 * 1024 })],
    }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CommunityController.prototype, "uploadPostImage", null);
__decorate([
    (0, rate_limit_decorator_1.RateLimit)({ points: 8, duration: 60 }),
    (0, common_1.Post)('posts'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_community_post_dto_1.CreateCommunityPostDto]),
    __metadata("design:returntype", Promise)
], CommunityController.prototype, "createPost", null);
__decorate([
    (0, common_1.Patch)('posts/:postId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('postId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, create_community_post_dto_1.UpdateCommunityPostDto]),
    __metadata("design:returntype", Promise)
], CommunityController.prototype, "updatePost", null);
__decorate([
    (0, common_1.Delete)('posts/:postId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('postId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CommunityController.prototype, "deletePost", null);
__decorate([
    (0, common_1.Post)('posts/:postId/save'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('postId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CommunityController.prototype, "savePost", null);
__decorate([
    (0, common_1.Delete)('posts/:postId/save'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('postId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CommunityController.prototype, "unsavePost", null);
__decorate([
    (0, common_1.Get)('me/saved'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('cursor')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Number]),
    __metadata("design:returntype", Promise)
], CommunityController.prototype, "saved", null);
__decorate([
    (0, common_1.Post)('posts/:postId/react'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('postId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, community_react_dto_1.CommunityReactDto]),
    __metadata("design:returntype", Promise)
], CommunityController.prototype, "reactPost", null);
__decorate([
    (0, common_1.Delete)('posts/:postId/react'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('postId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CommunityController.prototype, "unreactPost", null);
__decorate([
    (0, rate_limit_decorator_1.RateLimit)({ points: 25, duration: 60 }),
    (0, common_1.Post)('posts/:postId/comments'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('postId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, community_comment_dto_1.CreateCommunityCommentDto]),
    __metadata("design:returntype", Promise)
], CommunityController.prototype, "createComment", null);
__decorate([
    (0, common_1.Patch)('comments/:commentId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('commentId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, community_comment_dto_1.UpdateCommunityCommentDto]),
    __metadata("design:returntype", Promise)
], CommunityController.prototype, "updateComment", null);
__decorate([
    (0, common_1.Delete)('comments/:commentId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('commentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CommunityController.prototype, "deleteComment", null);
__decorate([
    (0, common_1.Post)('comments/:commentId/react'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('commentId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, community_react_dto_1.CommunityReactDto]),
    __metadata("design:returntype", Promise)
], CommunityController.prototype, "reactComment", null);
__decorate([
    (0, common_1.Delete)('comments/:commentId/react'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('commentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CommunityController.prototype, "unreactComment", null);
__decorate([
    (0, common_1.Post)('posts/:postId/best-answer'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('postId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, community_id_body_dto_1.CommentIdBodyDto]),
    __metadata("design:returntype", Promise)
], CommunityController.prototype, "bestAnswer", null);
__decorate([
    (0, common_1.Post)('posts/:postId/pin-comment'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('postId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, community_id_body_dto_1.CommentIdBodyDto]),
    __metadata("design:returntype", Promise)
], CommunityController.prototype, "pinComment", null);
__decorate([
    (0, common_1.Delete)('posts/:postId/pin-comment'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('postId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CommunityController.prototype, "unpinComment", null);
__decorate([
    (0, rate_limit_decorator_1.RateLimit)({ points: 15, duration: 300 }),
    (0, common_1.Post)('reports'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, community_report_dto_1.CreateCommunityReportDto]),
    __metadata("design:returntype", Promise)
], CommunityController.prototype, "report", null);
__decorate([
    (0, common_1.Post)('follows'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, community_follow_dto_1.CommunityFollowDto]),
    __metadata("design:returntype", Promise)
], CommunityController.prototype, "follow", null);
__decorate([
    (0, common_1.Delete)('follows/:targetType/:targetId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('targetType')),
    __param(2, (0, common_1.Param)('targetId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], CommunityController.prototype, "unfollow", null);
__decorate([
    (0, common_1.Get)('me/following'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CommunityController.prototype, "following", null);
__decorate([
    (0, common_1.Post)('blocks/:userId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CommunityController.prototype, "block", null);
__decorate([
    (0, common_1.Delete)('blocks/:userId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CommunityController.prototype, "unblock", null);
exports.CommunityController = CommunityController = __decorate([
    (0, common_1.Controller)('community'),
    __metadata("design:paramtypes", [community_service_1.CommunityService])
], CommunityController);
//# sourceMappingURL=community.controller.js.map