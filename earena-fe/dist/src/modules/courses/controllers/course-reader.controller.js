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
exports.CourseReaderController = void 0;
const common_1 = require("@nestjs/common");
const class_transformer_1 = require("class-transformer");
const course_reader_service_1 = require("../services/course-reader.service");
const course_reader_dto_1 = require("../dto/course-reader.dto");
const course_reader_response_dto_1 = require("../dto/course-reader-response.dto");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const optional_auth_decorator_1 = require("../../../common/decorators/optional-auth.decorator");
const pagination_dto_1 = require("../../../common/dto/pagination.dto");
const user_role_enum_1 = require("../../../common/enums/user-role.enum");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
const course_promotion_service_1 = require("../services/course-promotion.service");
let CourseReaderController = class CourseReaderController {
    courseReaderService;
    coursePromotionService;
    constructor(courseReaderService, coursePromotionService) {
        this.courseReaderService = courseReaderService;
        this.coursePromotionService = coursePromotionService;
    }
    async getFeaturedCarousel() {
        const data = await this.coursePromotionService.getFeaturedCarouselCourses();
        return { message: 'OK', data };
    }
    async searchPublicCourses(dto, userId) {
        if (dto.minPrice !== undefined &&
            dto.maxPrice !== undefined &&
            dto.minPrice > dto.maxPrice) {
            throw new common_1.BadRequestException('minPrice không được phép lớn hơn maxPrice.');
        }
        const payload = {
            keyword: dto.keyword,
            subjectId: dto.subjectId,
            page: dto.page || 1,
            limit: dto.limit || 20,
            isFree: dto.isFree,
            minPrice: dto.minPrice,
            maxPrice: dto.maxPrice,
            sort: dto.sort,
            userId,
        };
        const result = await this.courseReaderService.searchPublicCourses(payload);
        return { message: 'Lấy danh sách khóa học thành công', ...result };
    }
    async getPublicCourseDetail(slug, userId) {
        const data = await this.courseReaderService.getPublicCourseDetail(slug, userId);
        const serializedData = (0, class_transformer_1.plainToInstance)(course_reader_response_dto_1.CoursePublicDetailResponseDto, data, {
            excludeExtraneousValues: true,
        });
        return {
            message: 'Lấy chi tiết khóa học thành công',
            data: serializedData,
        };
    }
    async getStudyTree(courseId, userId) {
        const payload = {
            courseId,
            userId,
        };
        const data = await this.courseReaderService.getStudyTree(payload);
        const serializedData = (0, class_transformer_1.plainToInstance)(course_reader_response_dto_1.StudyTreeResponseDto, data, {
            excludeExtraneousValues: true,
        });
        return { message: 'Lấy dữ liệu học tập thành công', data: serializedData };
    }
    async getLessonContent(courseId, lessonId, userId) {
        const payload = {
            courseId,
            lessonId,
            userId,
        };
        const data = await this.courseReaderService.getLessonContent(payload);
        return { message: 'Lấy nội dung bài học thành công', data };
    }
    async getMyLearning(userId, query) {
        const payload = {
            userId,
            page: query.page || 1,
            limit: query.limit || 10,
        };
        const result = await this.courseReaderService.getMyLearningCourses(payload);
        return { message: 'Lấy danh sách khóa học của tôi thành công', ...result };
    }
};
exports.CourseReaderController = CourseReaderController;
__decorate([
    (0, optional_auth_decorator_1.OptionalAuth)(),
    (0, common_1.Get)('public/featured-carousel'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CourseReaderController.prototype, "getFeaturedCarousel", null);
__decorate([
    (0, optional_auth_decorator_1.OptionalAuth)(),
    (0, common_1.Get)('public'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [course_reader_dto_1.SearchPublicCoursesDto, String]),
    __metadata("design:returntype", Promise)
], CourseReaderController.prototype, "searchPublicCourses", null);
__decorate([
    (0, optional_auth_decorator_1.OptionalAuth)(),
    (0, common_1.Get)('public/:slug'),
    __param(0, (0, common_1.Param)('slug')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CourseReaderController.prototype, "getPublicCourseDetail", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(':courseId/study-tree'),
    __param(0, (0, common_1.Param)('courseId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CourseReaderController.prototype, "getStudyTree", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(':courseId/lessons/:lessonId/content'),
    __param(0, (0, common_1.Param)('courseId')),
    __param(1, (0, common_1.Param)('lessonId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], CourseReaderController.prototype, "getLessonContent", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.STUDENT, user_role_enum_1.UserRole.TEACHER),
    (0, common_1.Get)('my-learning'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", Promise)
], CourseReaderController.prototype, "getMyLearning", null);
exports.CourseReaderController = CourseReaderController = __decorate([
    (0, common_1.Controller)('courses'),
    __metadata("design:paramtypes", [course_reader_service_1.CourseReaderService,
        course_promotion_service_1.CoursePromotionService])
], CourseReaderController);
//# sourceMappingURL=course-reader.controller.js.map