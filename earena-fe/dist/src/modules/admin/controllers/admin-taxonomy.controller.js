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
exports.AdminTaxonomyController = void 0;
const common_1 = require("@nestjs/common");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
const roles_guard_1 = require("../../../common/guards/roles.guard");
const admin_service_1 = require("../admin.service");
const admin_taxonomy_dto_1 = require("../dto/admin-taxonomy.dto");
const user_role_enum_1 = require("../../../common/enums/user-role.enum");
let AdminTaxonomyController = class AdminTaxonomyController {
    adminService;
    constructor(adminService) {
        this.adminService = adminService;
    }
    async listSubjects() {
        return this.adminService.listSubjects();
    }
    async createSubject(dto) {
        return this.adminService.createSubject(dto);
    }
    async updateSubject(id, dto) {
        return this.adminService.updateSubject(id, dto);
    }
    async listTopics(subjectId) {
        return this.adminService.listTopicsBySubject(subjectId);
    }
    async createTopic(dto) {
        return this.adminService.createTopic(dto);
    }
    async updateTopic(id, dto) {
        return this.adminService.updateTopic(id, dto);
    }
    async deleteTopic(id) {
        return this.adminService.deleteTopic(id);
    }
};
exports.AdminTaxonomyController = AdminTaxonomyController;
__decorate([
    (0, common_1.Get)('subjects'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminTaxonomyController.prototype, "listSubjects", null);
__decorate([
    (0, common_1.Post)('subjects'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_taxonomy_dto_1.AdminCreateSubjectDto]),
    __metadata("design:returntype", Promise)
], AdminTaxonomyController.prototype, "createSubject", null);
__decorate([
    (0, common_1.Patch)('subjects/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, admin_taxonomy_dto_1.AdminUpdateSubjectDto]),
    __metadata("design:returntype", Promise)
], AdminTaxonomyController.prototype, "updateSubject", null);
__decorate([
    (0, common_1.Get)('subjects/:subjectId/topics'),
    __param(0, (0, common_1.Param)('subjectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminTaxonomyController.prototype, "listTopics", null);
__decorate([
    (0, common_1.Post)('topics'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_taxonomy_dto_1.AdminCreateTopicDto]),
    __metadata("design:returntype", Promise)
], AdminTaxonomyController.prototype, "createTopic", null);
__decorate([
    (0, common_1.Patch)('topics/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, admin_taxonomy_dto_1.AdminUpdateTopicDto]),
    __metadata("design:returntype", Promise)
], AdminTaxonomyController.prototype, "updateTopic", null);
__decorate([
    (0, common_1.Delete)('topics/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminTaxonomyController.prototype, "deleteTopic", null);
exports.AdminTaxonomyController = AdminTaxonomyController = __decorate([
    (0, common_1.Controller)('admin/taxonomy'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminTaxonomyController);
//# sourceMappingURL=admin-taxonomy.controller.js.map