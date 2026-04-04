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
exports.CurriculumController = void 0;
const common_1 = require("@nestjs/common");
const curriculum_service_1 = require("../services/curriculum.service");
const curriculum_dto_1 = require("../dto/curriculum.dto");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../../common/guards/roles.guard");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const user_role_enum_1 = require("../../../common/enums/user-role.enum");
const course_dto_1 = require("../dto/course.dto");
let CurriculumController = class CurriculumController {
    curriculumService;
    constructor(curriculumService) {
        this.curriculumService = curriculumService;
    }
    async createSection(courseId, dto, userId) {
        const payload = {
            courseId,
            teacherId: userId,
            title: dto.title,
            description: dto.description,
        };
        const data = await this.curriculumService.createSection(payload);
        return { message: 'Khởi tạo Chương thành công', data };
    }
    async createLesson(courseId, sectionId, dto, userId) {
        const payload = {
            courseId,
            sectionId,
            teacherId: userId,
            title: dto.title,
            isFreePreview: dto.isFreePreview ?? false,
            primaryVideoId: dto.primaryVideoId,
            attachments: dto.attachments,
            examId: dto.examId,
            content: dto.content,
            examRules: dto.examRules,
        };
        const data = await this.curriculumService.createLesson(payload);
        return { message: 'Thêm Bài học thành công', data };
    }
    async deleteSection(courseId, sectionId, userId) {
        return this.curriculumService.deleteSection(courseId, sectionId, userId);
    }
    async updateLesson(courseId, lessonId, dto, userId) {
        const payload = {
            courseId,
            lessonId,
            teacherId: userId,
            title: dto.title,
            isFreePreview: dto.isFreePreview,
            primaryVideoId: dto.primaryVideoId,
            attachments: dto.attachments,
            examId: dto.examId,
            content: dto.content,
            examRules: dto.examRules,
        };
        return this.curriculumService.updateLesson(payload);
    }
    async deleteLesson(courseId, lessonId, userId) {
        return this.curriculumService.deleteLesson(courseId, lessonId, userId);
    }
    async reorderCurriculum(courseId, dto, userId) {
        return this.curriculumService.reorderCurriculum({
            courseId,
            teacherId: userId,
            sections: dto.sections,
            lessons: dto.lessons,
        });
    }
    async updateSection(courseId, sectionId, dto, userId) {
        const payload = {
            courseId,
            sectionId,
            teacherId: userId,
            title: dto.title,
            description: dto.description,
        };
        return this.curriculumService.updateSection(payload);
    }
};
exports.CurriculumController = CurriculumController;
__decorate([
    (0, common_1.Post)(':courseId/sections'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.TEACHER, user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('courseId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, curriculum_dto_1.CreateSectionDto, String]),
    __metadata("design:returntype", Promise)
], CurriculumController.prototype, "createSection", null);
__decorate([
    (0, common_1.Post)(':courseId/sections/:sectionId/lessons'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.TEACHER, user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('courseId')),
    __param(1, (0, common_1.Param)('sectionId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, curriculum_dto_1.CreateLessonDto, String]),
    __metadata("design:returntype", Promise)
], CurriculumController.prototype, "createLesson", null);
__decorate([
    (0, common_1.Delete)(':courseId/sections/:sectionId'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.TEACHER, user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('courseId')),
    __param(1, (0, common_1.Param)('sectionId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], CurriculumController.prototype, "deleteSection", null);
__decorate([
    (0, common_1.Put)(':courseId/lessons/:lessonId'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.TEACHER, user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('courseId')),
    __param(1, (0, common_1.Param)('lessonId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, curriculum_dto_1.UpdateLessonDto, String]),
    __metadata("design:returntype", Promise)
], CurriculumController.prototype, "updateLesson", null);
__decorate([
    (0, common_1.Delete)(':courseId/lessons/:lessonId'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.TEACHER, user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('courseId')),
    __param(1, (0, common_1.Param)('lessonId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], CurriculumController.prototype, "deleteLesson", null);
__decorate([
    (0, common_1.Patch)(':courseId/curriculum/reorder'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.TEACHER, user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('courseId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, course_dto_1.ReorderCurriculumDto, String]),
    __metadata("design:returntype", Promise)
], CurriculumController.prototype, "reorderCurriculum", null);
__decorate([
    (0, common_1.Put)(':courseId/sections/:sectionId'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.TEACHER, user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('courseId')),
    __param(1, (0, common_1.Param)('sectionId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, curriculum_dto_1.UpdateSectionDto, String]),
    __metadata("design:returntype", Promise)
], CurriculumController.prototype, "updateSection", null);
exports.CurriculumController = CurriculumController = __decorate([
    (0, common_1.Controller)('courses'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [curriculum_service_1.CurriculumService])
], CurriculumController);
//# sourceMappingURL=curriculum.controller.js.map