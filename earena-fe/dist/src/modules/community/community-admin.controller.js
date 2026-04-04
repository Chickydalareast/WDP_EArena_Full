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
exports.CommunityAdminController = void 0;
const common_1 = require("@nestjs/common");
const user_role_enum_1 = require("../../common/enums/user-role.enum");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const roles_guard_1 = require("../../common/guards/roles.guard");
const community_service_1 = require("./community.service");
const community_admin_dto_1 = require("./dto/community-admin.dto");
const community_id_body_dto_1 = require("./dto/community-id-body.dto");
const community_constants_1 = require("./constants/community.constants");
let CommunityAdminController = class CommunityAdminController {
    communityService;
    constructor(communityService) {
        this.communityService = communityService;
    }
    async hidePost(actorId, postId) {
        const data = await this.communityService.adminHidePost(actorId, postId);
        return { message: 'OK', data };
    }
    async showPost(actorId, postId) {
        const data = await this.communityService.adminShowPost(actorId, postId);
        return { message: 'OK', data };
    }
    async feature(actorId, postId, body) {
        const data = await this.communityService.adminFeaturePost(actorId, postId, body.featured);
        return { message: 'OK', data };
    }
    async lockComments(actorId, postId, body) {
        const data = await this.communityService.adminLockComments(actorId, postId, body.locked);
        return { message: 'OK', data };
    }
    async reports(status, page, limit) {
        const data = await this.communityService.adminListReports(status, page || 1, limit || 20);
        return { message: 'OK', data };
    }
    async resolveReport(actorId, reportId, dto) {
        const data = await this.communityService.adminResolveReport(actorId, reportId, dto.status, dto.resolutionNote);
        return { message: 'OK', data };
    }
    async userStatus(actorId, userId, dto) {
        const data = await this.communityService.adminSetUserCommunityStatus(actorId, userId, dto);
        return { message: 'OK', data };
    }
    async audit(page, limit) {
        const data = await this.communityService.adminAuditLog(page || 1, limit || 50);
        return { message: 'OK', data };
    }
};
exports.CommunityAdminController = CommunityAdminController;
__decorate([
    (0, common_1.Patch)('posts/:postId/hide'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(1, (0, common_1.Param)('postId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CommunityAdminController.prototype, "hidePost", null);
__decorate([
    (0, common_1.Patch)('posts/:postId/show'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(1, (0, common_1.Param)('postId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CommunityAdminController.prototype, "showPost", null);
__decorate([
    (0, common_1.Post)('posts/:postId/feature'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(1, (0, common_1.Param)('postId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, community_id_body_dto_1.FeaturePostBodyDto]),
    __metadata("design:returntype", Promise)
], CommunityAdminController.prototype, "feature", null);
__decorate([
    (0, common_1.Post)('posts/:postId/lock-comments'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(1, (0, common_1.Param)('postId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, community_id_body_dto_1.LockCommentsBodyDto]),
    __metadata("design:returntype", Promise)
], CommunityAdminController.prototype, "lockComments", null);
__decorate([
    (0, common_1.Get)('reports'),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], CommunityAdminController.prototype, "reports", null);
__decorate([
    (0, common_1.Patch)('reports/:reportId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(1, (0, common_1.Param)('reportId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, community_admin_dto_1.ResolveCommunityReportDto]),
    __metadata("design:returntype", Promise)
], CommunityAdminController.prototype, "resolveReport", null);
__decorate([
    (0, common_1.Patch)('users/:userId/community-status'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(1, (0, common_1.Param)('userId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, community_admin_dto_1.SetUserCommunityStatusDto]),
    __metadata("design:returntype", Promise)
], CommunityAdminController.prototype, "userStatus", null);
__decorate([
    (0, common_1.Get)('audit'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], CommunityAdminController.prototype, "audit", null);
exports.CommunityAdminController = CommunityAdminController = __decorate([
    (0, common_1.Controller)('community/admin'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    __metadata("design:paramtypes", [community_service_1.CommunityService])
], CommunityAdminController);
//# sourceMappingURL=community-admin.controller.js.map