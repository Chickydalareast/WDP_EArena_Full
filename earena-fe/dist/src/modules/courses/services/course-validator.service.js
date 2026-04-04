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
var CourseValidatorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseValidatorService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("mongoose");
const media_repository_1 = require("../../media/media.repository");
const media_schema_1 = require("../../media/schemas/media.schema");
const users_repository_1 = require("../../users/users.repository");
const courses_repository_1 = require("../courses.repository");
let CourseValidatorService = CourseValidatorService_1 = class CourseValidatorService {
    mediaRepo;
    usersRepo;
    coursesRepo;
    logger = new common_1.Logger(CourseValidatorService_1.name);
    constructor(mediaRepo, usersRepo, coursesRepo) {
        this.mediaRepo = mediaRepo;
        this.usersRepo = usersRepo;
        this.coursesRepo = coursesRepo;
    }
    async validateTeacherSubjectAccess(teacherId, subjectId) {
        const teacher = await this.usersRepo.findByIdSafe(teacherId, {
            select: 'subjectIds',
        });
        if (!teacher || !teacher.subjectIds || teacher.subjectIds.length === 0) {
            throw new common_1.BadRequestException('Hồ sơ giáo viên chưa được cấu hình bộ môn chuyên trách.');
        }
        const hasAccess = teacher.subjectIds.some((id) => id.toString() === subjectId);
        if (!hasAccess) {
            throw new common_1.ForbiddenException('Bạn không có quyền tạo khóa học cho bộ môn này.');
        }
    }
    async verifyMediaOwnershipStrict(mediaIds, teacherId) {
        const validIds = mediaIds.filter((id) => !!id && mongoose_1.Types.ObjectId.isValid(id));
        if (validIds.length === 0)
            return;
        const medias = await this.mediaRepo.modelInstance
            .find({
            _id: { $in: validIds.map((id) => new mongoose_1.Types.ObjectId(id)) },
        })
            .lean()
            .select('uploadedBy status originalName')
            .exec();
        if (medias.length !== validIds.length) {
            throw new common_1.BadRequestException('Một hoặc nhiều tệp đính kèm không tồn tại trong hệ thống.');
        }
        for (const media of medias) {
            if (media.uploadedBy.toString() !== teacherId) {
                this.logger.warn(`[SECURITY ALERT] User ${teacherId} cố gắng gán Media ${media._id} của người khác!`);
                throw new common_1.ForbiddenException(`Tệp tin "${media.originalName}" không thuộc quyền sở hữu của bạn.`);
            }
            if (media.status !== media_schema_1.MediaStatus.READY) {
                throw new common_1.BadRequestException(`Tệp tin "${media.originalName}" đang xử lý hoặc bị lỗi, chưa thể sử dụng.`);
            }
        }
    }
    async verifyExamOwnershipStrict(examId, teacherId) {
        if (!examId || !mongoose_1.Types.ObjectId.isValid(examId))
            return;
    }
    async validateCourseSubmissionRules(payload) {
        const { teacherId, price } = payload;
        const teacher = await this.usersRepo.findUserWithSubscription(teacherId);
        if (!teacher) {
            throw new common_1.BadRequestException('Giáo viên không tồn tại trong hệ thống.');
        }
        const currentPlan = teacher.currentPlanId;
        const planExpiresAt = teacher.planExpiresAt;
        const now = new Date();
        if (!currentPlan) {
            throw new common_1.ForbiddenException('Tài khoản của bạn chưa đăng ký gói cước. Vui lòng nâng cấp để xuất bản khóa học.');
        }
        if (!currentPlan.isActive) {
            throw new common_1.ForbiddenException(`Gói cước "${currentPlan.name}" hiện đã ngừng cung cấp hoặc bị vô hiệu hóa. Vui lòng liên hệ Admin.`);
        }
        if (!planExpiresAt || new Date(planExpiresAt) <= now) {
            throw new common_1.ForbiddenException(`Gói cước "${currentPlan.name}" của bạn đã hết hạn. Vui lòng gia hạn để tiếp tục xuất bản khóa học.`);
        }
        if (price > 0 && !currentPlan.canCreatePaidCourse) {
            throw new common_1.ForbiddenException(`Gói cước "${currentPlan.name}" không hỗ trợ tạo khóa học Trả phí. Vui lòng nâng cấp gói PRO hoặc ENTERPRISE.`);
        }
        if (!currentPlan.isUnlimitedCourses) {
            const activeCoursesCount = await this.coursesRepo.countTeacherActiveCourses(teacherId);
            const maxAllowed = currentPlan.maxCourses;
            if (activeCoursesCount >= maxAllowed) {
                throw new common_1.ForbiddenException(`Bạn đã đạt giới hạn xuất bản khóa học (${activeCoursesCount}/${maxAllowed}) của gói "${currentPlan.name}". Vui lòng nâng cấp gói cước để tạo thêm.`);
            }
        }
    }
};
exports.CourseValidatorService = CourseValidatorService;
exports.CourseValidatorService = CourseValidatorService = CourseValidatorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [media_repository_1.MediaRepository,
        users_repository_1.UsersRepository,
        courses_repository_1.CoursesRepository])
], CourseValidatorService);
//# sourceMappingURL=course-validator.service.js.map