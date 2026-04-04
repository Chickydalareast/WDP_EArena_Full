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
exports.CoursesController = void 0;
const common_1 = require("@nestjs/common");
const courses_service_1 = require("./courses.service");
const create_course_dto_1 = require("./dto/create-course.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const teacher_verified_decorator_1 = require("../../common/decorators/teacher-verified.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const user_role_enum_1 = require("../../common/enums/user-role.enum");
const course_dto_1 = require("./dto/course.dto");
const promote_course_dto_1 = require("./dto/promote-course.dto");
const course_promotion_service_1 = require("./services/course-promotion.service");
let CoursesController = class CoursesController {
    coursesService;
    coursePromotionService;
    constructor(coursesService, coursePromotionService) {
        this.coursesService = coursesService;
        this.coursePromotionService = coursePromotionService;
    }
    async createCourse(dto, userId) {
        const payload = {
            title: dto.title,
            price: dto.price,
            description: dto.description,
            teacherId: userId,
            progressionMode: dto.progressionMode,
            isStrictExam: dto.isStrictExam,
        };
        const result = await this.coursesService.createCourse(payload);
        return {
            message: 'Khởi tạo khóa học thành công',
            data: result,
        };
    }
    async updateCourse(id, dto, userId) {
        const payload = {
            courseId: id,
            teacherId: userId,
            title: dto.title,
            price: dto.price,
            discountPrice: dto.discountPrice,
            description: dto.description,
            benefits: dto.benefits,
            requirements: dto.requirements,
            coverImageId: dto.coverImageId,
            promotionalVideoId: dto.promotionalVideoId,
            progressionMode: dto.progressionMode,
            isStrictExam: dto.isStrictExam,
        };
        return this.coursesService.updateCourse(payload);
    }
    async deleteCourse(id, userId) {
        return this.coursesService.deleteCourse(id, userId);
    }
    async getMyCourses(userId) {
        const data = await this.coursesService.getMyCourses(userId);
        return {
            message: 'Lấy danh sách khóa học của tôi thành công',
            data,
        };
    }
    async getTeacherCourseDetail(id, userId) {
        const data = await this.coursesService.getTeacherCourseDetail(id, userId);
        return {
            message: 'Lấy thông tin cài đặt khóa học thành công',
            data,
        };
    }
    async getTeacherCourseCurriculum(id, userId) {
        const data = await this.coursesService.getTeacherCourseCurriculum(id, userId);
        return {
            message: 'Lấy cấu trúc khóa học thành công',
            data,
        };
    }
    async getDashboardStats(id, userId) {
        const data = await this.coursesService.getTeacherCourseStats(id, userId);
        return {
            message: 'Lấy thống kê khóa học thành công',
            data,
        };
    }
    async submitCourseForReview(id, userId) {
        return this.coursesService.submitCourseForReview(id, userId);
    }
    async promoteCourse(id, dto, userId) {
        return this.coursePromotionService.purchasePromotion(userId, id, dto.durationDays);
    }
};
exports.CoursesController = CoursesController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.TEACHER, user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_course_dto_1.CreateCourseDto, String]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "createCourse", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.TEACHER, user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, course_dto_1.UpdateCourseDto, String]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "updateCourse", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.TEACHER, user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "deleteCourse", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.TEACHER, user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "getMyCourses", null);
__decorate([
    (0, common_1.Get)('teacher/:id'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.TEACHER, user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "getTeacherCourseDetail", null);
__decorate([
    (0, common_1.Get)('teacher/:id/curriculum-view'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.TEACHER, user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "getTeacherCourseCurriculum", null);
__decorate([
    (0, common_1.Get)('teacher/:id/dashboard-stats'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.TEACHER, user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "getDashboardStats", null);
__decorate([
    (0, common_1.Patch)(':id/submit-for-review'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.TEACHER, user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "submitCourseForReview", null);
__decorate([
    (0, common_1.Post)(':id/promote'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.TEACHER, user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, promote_course_dto_1.PromoteCourseDto, String]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "promoteCourse", null);
exports.CoursesController = CoursesController = __decorate([
    (0, common_1.Controller)('courses'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, teacher_verified_decorator_1.RequireTeacherVerified)(),
    __metadata("design:paramtypes", [courses_service_1.CoursesService,
        course_promotion_service_1.CoursePromotionService])
], CoursesController);
//# sourceMappingURL=courses.controller.js.map