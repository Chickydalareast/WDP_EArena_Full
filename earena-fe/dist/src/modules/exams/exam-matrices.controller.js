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
exports.ExamMatricesController = void 0;
const common_1 = require("@nestjs/common");
const exam_matrices_service_1 = require("./exam-matrices.service");
const exam_matrix_dto_1 = require("./dto/exam-matrix.dto");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const roles_guard_1 = require("../../common/guards/roles.guard");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const user_role_enum_1 = require("../../common/enums/user-role.enum");
let ExamMatricesController = class ExamMatricesController {
    matricesService;
    constructor(matricesService) {
        this.matricesService = matricesService;
    }
    async createMatrix(dto, userId) {
        const payload = {
            title: dto.title,
            description: dto.description,
            subjectId: dto.subjectId,
            sections: dto.sections,
        };
        return this.matricesService.createMatrixTemplate(userId, payload);
    }
    async getMatrices(query, userId) {
        return this.matricesService.getMatrices(userId, {
            page: query.page || 1,
            limit: query.limit || 10,
            subjectId: query.subjectId,
            search: query.search,
        });
    }
    async getMatrixDetail(id, userId) {
        return this.matricesService.getMatrixDetail(id, userId);
    }
    async deleteMatrix(id, userId) {
        return this.matricesService.deleteMatrix(id, userId);
    }
    async updateMatrix(id, dto, userId) {
        const payload = {
            title: dto.title,
            description: dto.description,
            subjectId: dto.subjectId,
            sections: dto.sections,
        };
        return this.matricesService.updateMatrix(id, userId, payload);
    }
    async cloneMatrix(id, userId) {
        return this.matricesService.cloneMatrix(id, userId);
    }
};
exports.ExamMatricesController = ExamMatricesController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.TEACHER),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [exam_matrix_dto_1.CreateExamMatrixDto, String]),
    __metadata("design:returntype", Promise)
], ExamMatricesController.prototype, "createMatrix", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.TEACHER),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ExamMatricesController.prototype, "getMatrices", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.TEACHER),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ExamMatricesController.prototype, "getMatrixDetail", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.TEACHER),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ExamMatricesController.prototype, "deleteMatrix", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.TEACHER),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, exam_matrix_dto_1.UpdateExamMatrixDto, String]),
    __metadata("design:returntype", Promise)
], ExamMatricesController.prototype, "updateMatrix", null);
__decorate([
    (0, common_1.Post)(':id/clone'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.TEACHER),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ExamMatricesController.prototype, "cloneMatrix", null);
exports.ExamMatricesController = ExamMatricesController = __decorate([
    (0, common_1.Controller)('exam-matrices'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [exam_matrices_service_1.ExamMatricesService])
], ExamMatricesController);
//# sourceMappingURL=exam-matrices.controller.js.map