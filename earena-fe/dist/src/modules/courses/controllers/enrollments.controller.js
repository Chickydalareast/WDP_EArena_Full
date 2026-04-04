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
exports.EnrollmentsController = void 0;
const common_1 = require("@nestjs/common");
const enrollments_service_1 = require("../services/enrollments.service");
const enrollment_dto_1 = require("../dto/enrollment.dto");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const course_checkout_service_1 = require("../services/course-checkout.service");
let EnrollmentsController = class EnrollmentsController {
    enrollmentsService;
    checkoutService;
    constructor(enrollmentsService, checkoutService) {
        this.enrollmentsService = enrollmentsService;
        this.checkoutService = checkoutService;
    }
    async enrollCourse(courseId, userId) {
        const payload = { userId, courseId };
        return this.checkoutService.checkoutCourse(payload);
    }
    async markCompleted(dto, userId) {
        const payload = {
            userId,
            courseId: dto.courseId,
            lessonId: dto.lessonId,
        };
        return this.enrollmentsService.markLessonCompleted(payload);
    }
};
exports.EnrollmentsController = EnrollmentsController;
__decorate([
    (0, common_1.Post)(':courseId/enroll'),
    __param(0, (0, common_1.Param)('courseId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], EnrollmentsController.prototype, "enrollCourse", null);
__decorate([
    (0, common_1.Post)('mark-completed'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [enrollment_dto_1.MarkLessonDto, String]),
    __metadata("design:returntype", Promise)
], EnrollmentsController.prototype, "markCompleted", null);
exports.EnrollmentsController = EnrollmentsController = __decorate([
    (0, common_1.Controller)('enrollments'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [enrollments_service_1.EnrollmentsService,
        course_checkout_service_1.CourseCheckoutService])
], EnrollmentsController);
//# sourceMappingURL=enrollments.controller.js.map