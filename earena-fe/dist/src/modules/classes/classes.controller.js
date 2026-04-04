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
exports.ClassesController = void 0;
const common_1 = require("@nestjs/common");
const classes_service_1 = require("./classes.service");
const dto_1 = require("./dto");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const rate_limit_decorator_1 = require("../../common/decorators/rate-limit.decorator");
const optional_auth_decorator_1 = require("../../common/decorators/optional-auth.decorator");
let ClassesController = class ClassesController {
    classesService;
    constructor(classesService) {
        this.classesService = classesService;
    }
    async createClass(dto, userId) {
        return this.classesService.createClass({
            ...dto,
            teacherId: userId,
        });
    }
    async searchClasses(query) {
        return this.classesService.searchPublicClasses({
            ...query,
            page: Math.max(1, Number(query.page) || 1),
            limit: Math.max(1, Number(query.limit) || 20),
        });
    }
    async requestJoin(classId, userId) {
        return this.classesService.requestJoin(classId, userId);
    }
    async joinByCode(dto, userId) {
        return this.classesService.joinByCode(dto.code, userId);
    }
    async reviewMember(classId, dto, userId) {
        return this.classesService.reviewMember(classId, userId, dto.studentId, dto.status);
    }
    async getClassPreview(classId, userId) {
        return this.classesService.getClassPreview(classId, userId);
    }
    async getClassMembers(classId, query, userId) {
        return this.classesService.getClassMembers(classId, userId, {
            status: query.status,
            page: Math.max(1, Number(query.page) || 1),
            limit: Math.max(1, Number(query.limit) || 20)
        });
    }
    async getMyClasses(userId) {
        return this.classesService.getMyClasses(userId);
    }
    async getClassDetailForTeacher(classId, userId) {
        return this.classesService.getClassDetailForTeacher(classId, userId);
    }
    async updateClass(classId, dto, userId) {
        const payload = { ...dto };
        return this.classesService.updateClass(classId, userId, payload);
    }
    async deleteClass(classId, userId) {
        return this.classesService.deleteClass(classId, userId);
    }
    async kickStudent(classId, studentId, userId) {
        return this.classesService.kickStudent(classId, userId, studentId);
    }
    async getJoinedClasses(userId, page, limit) {
        return this.classesService.getJoinedClasses(userId, Math.max(1, Number(page) || 1), Math.max(1, Number(limit) || 20));
    }
    async getStudentWorkspace(classId, userId) {
        return this.classesService.getStudentWorkspace(classId, userId);
    }
    async leaveClass(classId, userId) {
        return this.classesService.leaveClass(classId, userId);
    }
    async resetClassCode(classId, userId) {
        return this.classesService.resetClassCode(classId, userId);
    }
};
exports.ClassesController = ClassesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateClassDto, String]),
    __metadata("design:returntype", Promise)
], ClassesController.prototype, "createClass", null);
__decorate([
    (0, common_1.Get)('search'),
    (0, public_decorator_1.Public)(),
    (0, rate_limit_decorator_1.RateLimit)({ points: 10, duration: 10 }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.SearchClassDto]),
    __metadata("design:returntype", Promise)
], ClassesController.prototype, "searchClasses", null);
__decorate([
    (0, common_1.Post)(':id/request-join'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ClassesController.prototype, "requestJoin", null);
__decorate([
    (0, common_1.Post)('join-by-code'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.JoinByCodeDto, String]),
    __metadata("design:returntype", Promise)
], ClassesController.prototype, "joinByCode", null);
__decorate([
    (0, common_1.Patch)(':id/review-member'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.ReviewMemberDto, String]),
    __metadata("design:returntype", Promise)
], ClassesController.prototype, "reviewMember", null);
__decorate([
    (0, common_1.Get)(':id/preview'),
    (0, optional_auth_decorator_1.OptionalAuth)(),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ClassesController.prototype, "getClassPreview", null);
__decorate([
    (0, common_1.Get)(':id/members'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.GetMembersDto, String]),
    __metadata("design:returntype", Promise)
], ClassesController.prototype, "getClassMembers", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ClassesController.prototype, "getMyClasses", null);
__decorate([
    (0, common_1.Get)(':id/detail'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ClassesController.prototype, "getClassDetailForTeacher", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateClassDto, String]),
    __metadata("design:returntype", Promise)
], ClassesController.prototype, "updateClass", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ClassesController.prototype, "deleteClass", null);
__decorate([
    (0, common_1.Delete)(':id/members/:studentId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('studentId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ClassesController.prototype, "kickStudent", null);
__decorate([
    (0, common_1.Get)('joined'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ClassesController.prototype, "getJoinedClasses", null);
__decorate([
    (0, common_1.Get)(':id/workspace'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ClassesController.prototype, "getStudentWorkspace", null);
__decorate([
    (0, common_1.Delete)(':id/leave'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ClassesController.prototype, "leaveClass", null);
__decorate([
    (0, common_1.Patch)(':id/reset-code'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ClassesController.prototype, "resetClassCode", null);
exports.ClassesController = ClassesController = __decorate([
    (0, common_1.Controller)('classes'),
    __metadata("design:paramtypes", [classes_service_1.ClassesService])
], ClassesController);
//# sourceMappingURL=classes.controller.js.map