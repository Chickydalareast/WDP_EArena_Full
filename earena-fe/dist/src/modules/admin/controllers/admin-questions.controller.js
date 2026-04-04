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
exports.AdminQuestionsController = void 0;
const common_1 = require("@nestjs/common");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
const roles_guard_1 = require("../../../common/guards/roles.guard");
const admin_service_1 = require("../admin.service");
const admin_questions_dto_1 = require("../dto/admin-questions.dto");
const user_role_enum_1 = require("../../../common/enums/user-role.enum");
let AdminQuestionsController = class AdminQuestionsController {
    adminService;
    constructor(adminService) {
        this.adminService = adminService;
    }
    async list(query) {
        return this.adminService.listQuestions({
            page: query.page || 1,
            limit: query.limit || 20,
            search: query.search,
            ownerId: query.ownerId,
            folderId: query.folderId,
            topicId: query.topicId,
        });
    }
    async archive(id, dto) {
        return this.adminService.setQuestionArchived(id, dto.isArchived);
    }
    async delete(id) {
        return this.adminService.deleteQuestion(id);
    }
};
exports.AdminQuestionsController = AdminQuestionsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_questions_dto_1.AdminListQuestionsQueryDto]),
    __metadata("design:returntype", Promise)
], AdminQuestionsController.prototype, "list", null);
__decorate([
    (0, common_1.Patch)(':id/archive'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, admin_questions_dto_1.AdminSetQuestionArchiveDto]),
    __metadata("design:returntype", Promise)
], AdminQuestionsController.prototype, "archive", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminQuestionsController.prototype, "delete", null);
exports.AdminQuestionsController = AdminQuestionsController = __decorate([
    (0, common_1.Controller)('admin/questions'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminQuestionsController);
//# sourceMappingURL=admin-questions.controller.js.map