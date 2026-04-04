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
exports.CourseReviewsController = void 0;
const common_1 = require("@nestjs/common");
const course_reviews_service_1 = require("../services/course-reviews.service");
const course_review_dto_1 = require("../dto/course-review.dto");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../../common/guards/roles.guard");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const user_role_enum_1 = require("../../../common/enums/user-role.enum");
const public_decorator_1 = require("../../../common/decorators/public.decorator");
const pagination_dto_1 = require("../../../common/dto/pagination.dto");
let CourseReviewsController = class CourseReviewsController {
    courseReviewsService;
    constructor(courseReviewsService) {
        this.courseReviewsService = courseReviewsService;
    }
    async createReview(courseId, dto, userId) {
        const payload = {
            courseId,
            userId,
            rating: dto.rating,
            comment: dto.comment,
        };
        return this.courseReviewsService.createReview(payload);
    }
    async replyReview(courseId, reviewId, dto, teacherId) {
        const payload = {
            reviewId,
            courseId,
            teacherId,
            reply: dto.reply,
        };
        return this.courseReviewsService.replyReview(payload);
    }
    async getReviews(courseId, query) {
        const payload = {
            courseId,
            page: Number(query.page) || 1,
            limit: Number(query.limit) || 10,
        };
        const data = await this.courseReviewsService.getReviews(payload);
        return {
            message: 'Lấy danh sách đánh giá thành công',
            data: data.items,
            meta: data.meta,
        };
    }
};
exports.CourseReviewsController = CourseReviewsController;
__decorate([
    (0, common_1.Post)(':courseId/reviews'),
    __param(0, (0, common_1.Param)('courseId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, course_review_dto_1.CreateCourseReviewDto, String]),
    __metadata("design:returntype", Promise)
], CourseReviewsController.prototype, "createReview", null);
__decorate([
    (0, common_1.Patch)(':courseId/reviews/:reviewId/reply'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.TEACHER, user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('courseId')),
    __param(1, (0, common_1.Param)('reviewId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, course_review_dto_1.ReplyCourseReviewDto, String]),
    __metadata("design:returntype", Promise)
], CourseReviewsController.prototype, "replyReview", null);
__decorate([
    (0, common_1.Get)(':courseId/reviews'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Param)('courseId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", Promise)
], CourseReviewsController.prototype, "getReviews", null);
exports.CourseReviewsController = CourseReviewsController = __decorate([
    (0, common_1.Controller)('courses'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [course_reviews_service_1.CourseReviewsService])
], CourseReviewsController);
//# sourceMappingURL=course-reviews.controller.js.map