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
exports.TeachersController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const teacher_verified_decorator_1 = require("../../common/decorators/teacher-verified.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const users_service_1 = require("../users/users.service");
const user_role_enum_1 = require("../../common/enums/user-role.enum");
const user_schema_1 = require("../users/schemas/user.schema");
class UploadQualificationDto {
    url;
    name;
}
class RejectQualificationDto {
    qualificationIndex;
    reason;
}
let TeachersController = class TeachersController {
    usersService;
    constructor(usersService) {
        this.usersService = usersService;
    }
    async getQualifications(userId) {
        const user = await this.usersService.findById(userId);
        if (!user)
            throw new common_1.NotFoundException('Không tìm thấy tài khoản');
        return {
            data: {
                qualifications: user.qualifications || [],
                hasUploadedQualifications: user.hasUploadedQualifications || false,
                verificationStatus: user.teacherVerificationStatus,
            }
        };
    }
    async uploadQualification(userId, dto) {
        const user = await this.usersService.findById(userId);
        if (!user)
            throw new common_1.NotFoundException('Không tìm thấy tài khoản');
        if (user.role !== user_role_enum_1.UserRole.TEACHER) {
            throw new common_1.ForbiddenException('Chỉ tài khoản giáo viên mới được phép tải lên bằng cấp');
        }
        const newQualification = {
            url: dto.url,
            name: dto.name,
            uploadedAt: new Date(),
        };
        const updated = await this.usersService.addQualification(userId, newQualification);
        return {
            message: 'Tải lên bằng cấp thành công',
            data: {
                qualifications: updated.qualifications,
                hasUploadedQualifications: updated.hasUploadedQualifications,
            }
        };
    }
    async deleteQualification(userId, indexStr) {
        const user = await this.usersService.findById(userId);
        if (!user)
            throw new common_1.NotFoundException('Không tìm thấy tài khoản');
        if (user.teacherVerificationStatus === user_schema_1.TeacherVerificationStatus.VERIFIED) {
            throw new common_1.ForbiddenException('Không thể xóa bằng cấp khi tài khoản đã được xác minh');
        }
        const index = parseInt(indexStr, 10);
        const updated = await this.usersService.removeQualification(userId, index);
        if (!updated)
            throw new common_1.NotFoundException('Không tìm thấy tài khoản');
        return {
            message: 'Xóa bằng cấp thành công',
            data: {
                qualifications: updated.qualifications,
                hasUploadedQualifications: updated.hasUploadedQualifications,
            }
        };
    }
    async submitForVerification(userId) {
        const user = await this.usersService.findById(userId);
        if (!user)
            throw new common_1.NotFoundException('Không tìm thấy tài khoản');
        if (user.role !== user_role_enum_1.UserRole.TEACHER) {
            throw new common_1.ForbiddenException('Chỉ tài khoản giáo viên mới được phép gửi xét duyệt');
        }
        if (!user.hasUploadedQualifications || !user.qualifications || user.qualifications.length === 0) {
            throw new common_1.ForbiddenException('Vui lòng tải lên ít nhất một bằng cấp trước khi gửi xét duyệt');
        }
        if (user.teacherVerificationStatus === user_schema_1.TeacherVerificationStatus.VERIFIED) {
            throw new common_1.ForbiddenException('Tài khoản của bạn đã được xác minh');
        }
        await this.usersService.updateTeacherVerificationStatus(userId, user_schema_1.TeacherVerificationStatus.PENDING, 'Đã gửi hồ sơ xét duyệt');
        return {
            message: 'Hồ sơ đã được gửi để xét duyệt. Vui lòng chờ quản trị viên xử lý.'
        };
    }
};
exports.TeachersController = TeachersController;
__decorate([
    (0, common_1.Get)('qualifications'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TeachersController.prototype, "getQualifications", null);
__decorate([
    (0, common_1.Post)('qualifications'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UploadQualificationDto]),
    __metadata("design:returntype", Promise)
], TeachersController.prototype, "uploadQualification", null);
__decorate([
    (0, common_1.Delete)('qualifications/:index'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(1, (0, common_1.Param)('index')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TeachersController.prototype, "deleteQualification", null);
__decorate([
    (0, common_1.Post)('qualifications/submit-review'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TeachersController.prototype, "submitForVerification", null);
exports.TeachersController = TeachersController = __decorate([
    (0, common_1.Controller)('teachers'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, teacher_verified_decorator_1.RequireTeacherVerified)(),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], TeachersController);
//# sourceMappingURL=teachers.controller.js.map