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
exports.AdminCoursesController = void 0;
const common_1 = require("@nestjs/common");
const admin_courses_service_1 = require("../services/admin-courses.service");
const admin_courses_dto_1 = require("../dto/admin-courses.dto");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../../common/guards/roles.guard");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
const user_role_enum_1 = require("../../../common/enums/user-role.enum");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
let AdminCoursesController = class AdminCoursesController {
    adminCoursesService;
    constructor(adminCoursesService) {
        this.adminCoursesService = adminCoursesService;
    }
    async getPendingCourses(query) {
        const data = await this.adminCoursesService.getPendingCourses({
            page: query.page ?? 1,
            limit: query.limit ?? 10,
        });
        return {
            message: 'Lấy danh sách khóa học chờ duyệt thành công.',
            data: data.items,
            meta: data.meta,
        };
    }
    async getCourseDetailForReview(id) {
        const data = await this.adminCoursesService.getCourseDetailForReview(id);
        return {
            message: 'Lấy chi tiết khóa học thành công.',
            data,
        };
    }
    async approveCourse(id, adminId) {
        const result = await this.adminCoursesService.approveCourse({ courseId: id, adminId });
        return result;
    }
    async rejectCourse(id, dto, adminId) {
        const result = await this.adminCoursesService.rejectCourse({
            courseId: id,
            reason: dto.reason,
            adminId,
        });
        return result;
    }
    async getAllCourses(query) {
        const data = await this.adminCoursesService.getAllCourses({
            page: query.page ?? 1,
            limit: query.limit ?? 10,
            search: query.search,
            status: query.status,
            teacherId: query.teacherId,
        });
        return {
            message: 'Lấy danh sách khóa học tổng thành công.',
            data: data.items,
            meta: data.meta,
        };
    }
    async forceTakedownCourse(id, dto, adminId) {
        const result = await this.adminCoursesService.forceTakedownCourse({
            courseId: id,
            reason: dto.reason,
            adminId,
        });
        return result;
    }
};
exports.AdminCoursesController = AdminCoursesController;
__decorate([
    (0, common_1.Get)('pending'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_courses_dto_1.GetPendingCoursesDto]),
    __metadata("design:returntype", Promise)
], AdminCoursesController.prototype, "getPendingCourses", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminCoursesController.prototype, "getCourseDetailForReview", null);
__decorate([
    (0, common_1.Patch)(':id/approve'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminCoursesController.prototype, "approveCourse", null);
__decorate([
    (0, common_1.Patch)(':id/reject'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, admin_courses_dto_1.RejectCourseDto, String]),
    __metadata("design:returntype", Promise)
], AdminCoursesController.prototype, "rejectCourse", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_courses_dto_1.GetAdminCoursesDto]),
    __metadata("design:returntype", Promise)
], AdminCoursesController.prototype, "getAllCourses", null);
__decorate([
    (0, common_1.Patch)(':id/force-takedown'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, admin_courses_dto_1.ForceTakedownCourseDto, String]),
    __metadata("design:returntype", Promise)
], AdminCoursesController.prototype, "forceTakedownCourse", null);
exports.AdminCoursesController = AdminCoursesController = __decorate([
    (0, common_1.Controller)('admin/courses'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    __metadata("design:paramtypes", [admin_courses_service_1.AdminCoursesService])
], AdminCoursesController);
//# sourceMappingURL=admin-courses.controller.js.map