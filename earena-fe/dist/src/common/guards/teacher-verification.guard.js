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
exports.TeacherVerificationGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("../../modules/users/schemas/user.schema");
const user_role_enum_1 = require("../enums/user-role.enum");
const teacher_verified_decorator_1 = require("../decorators/teacher-verified.decorator");
const public_decorator_1 = require("../decorators/public.decorator");
let TeacherVerificationGuard = class TeacherVerificationGuard {
    reflector;
    userModel;
    constructor(reflector, userModel) {
        this.reflector = reflector;
        this.userModel = userModel;
    }
    async canActivate(context) {
        const isPublic = this.reflector.getAllAndOverride(public_decorator_1.IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }
        const requireVerified = this.reflector.getAllAndOverride(teacher_verified_decorator_1.IS_TEACHER_VERIFIED_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requireVerified) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const { user } = request;
        if (!user || !user.userId) {
            throw new common_1.UnauthorizedException('Vui lòng đăng nhập');
        }
        if (user.role !== user_role_enum_1.UserRole.TEACHER) {
            return true;
        }
        const dbUser = await this.userModel.findById(user.userId).select('teacherVerificationStatus').lean();
        if (!dbUser) {
            throw new common_1.UnauthorizedException('Không tìm thấy tài khoản');
        }
        if (dbUser.teacherVerificationStatus !== user_schema_1.TeacherVerificationStatus.VERIFIED) {
            throw new common_1.ForbiddenException('Tài khoản giáo viên của bạn chưa được xác minh. Vui lòng chờ quản trị viên phê duyệt hoặc liên hệ hỗ trợ.');
        }
        return true;
    }
};
exports.TeacherVerificationGuard = TeacherVerificationGuard;
exports.TeacherVerificationGuard = TeacherVerificationGuard = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [core_1.Reflector,
        mongoose_2.Model])
], TeacherVerificationGuard);
//# sourceMappingURL=teacher-verification.guard.js.map