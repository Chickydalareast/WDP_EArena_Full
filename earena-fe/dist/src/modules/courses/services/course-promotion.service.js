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
exports.CoursePromotionService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const course_promotion_schema_1 = require("../schemas/course-promotion.schema");
const course_schema_1 = require("../schemas/course.schema");
const courses_repository_1 = require("../courses.repository");
const wallets_service_1 = require("../../wallets/wallets.service");
const wallet_transaction_schema_1 = require("../../wallets/schemas/wallet-transaction.schema");
const pricing_plans_repository_1 = require("../../subscriptions/repositories/pricing-plans.repository");
const pricing_plan_schema_1 = require("../../subscriptions/schemas/pricing-plan.schema");
const user_schema_1 = require("../../users/schemas/user.schema");
const user_role_enum_1 = require("../../../common/enums/user-role.enum");
const CAROUSEL_MAX = 12;
const ALLOWED_DAYS = new Set([7, 14, 30]);
let CoursePromotionService = class CoursePromotionService {
    promoModel;
    courseModel;
    userModel;
    coursesRepo;
    walletsService;
    pricingPlansRepo;
    config;
    constructor(promoModel, courseModel, userModel, coursesRepo, walletsService, pricingPlansRepo, config) {
        this.promoModel = promoModel;
        this.courseModel = courseModel;
        this.userModel = userModel;
        this.coursesRepo = coursesRepo;
        this.walletsService = walletsService;
        this.pricingPlansRepo = pricingPlansRepo;
        this.config = config;
    }
    coinsPerDay() {
        const raw = this.config.get('COURSE_PROMOTION_COINS_PER_DAY');
        const n = raw ? Number(raw) : NaN;
        return Number.isFinite(n) && n > 0 ? n : 50_000;
    }
    async getFeaturedCarouselCourses() {
        const now = new Date();
        const orderedIds = [];
        const seen = new Set();
        const promos = await this.promoModel
            .find({ expiresAt: { $gt: now } })
            .sort({ expiresAt: -1 })
            .limit(CAROUSEL_MAX)
            .lean()
            .exec();
        for (const p of promos) {
            const id = p.courseId?.toString?.();
            if (!id || seen.has(id))
                continue;
            seen.add(id);
            orderedIds.push(new mongoose_2.Types.ObjectId(id));
            if (orderedIds.length >= CAROUSEL_MAX)
                break;
        }
        const enterprisePlan = await this.pricingPlansRepo.findOne({
            code: pricing_plan_schema_1.PricingPlanCode.ENTERPRISE,
            isActive: true,
        });
        if (enterprisePlan && orderedIds.length < CAROUSEL_MAX) {
            const entTeachers = await this.userModel
                .find({
                role: user_role_enum_1.UserRole.TEACHER,
                currentPlanId: enterprisePlan._id,
                planExpiresAt: { $gt: now },
            })
                .select('_id')
                .lean()
                .exec();
            const tids = entTeachers.map((u) => u._id);
            if (tids.length) {
                const entCourses = await this.courseModel
                    .find({
                    status: course_schema_1.CourseStatus.PUBLISHED,
                    teacherId: { $in: tids },
                })
                    .sort({ createdAt: -1 })
                    .limit(CAROUSEL_MAX * 2)
                    .select('_id')
                    .lean()
                    .exec();
                for (const c of entCourses) {
                    const sid = c._id.toString();
                    if (seen.has(sid))
                        continue;
                    seen.add(sid);
                    orderedIds.push(c._id);
                    if (orderedIds.length >= CAROUSEL_MAX)
                        break;
                }
            }
        }
        const items = await this.coursesRepo.findPublishedPublicCardsByOrderedIds(orderedIds);
        return {
            items,
            promoPricePerDay: this.coinsPerDay(),
        };
    }
    async purchasePromotion(teacherId, courseId, durationDays) {
        if (!ALLOWED_DAYS.has(durationDays)) {
            throw new common_1.BadRequestException('Chọn thời hạn 7, 14 hoặc 30 ngày.');
        }
        const course = await this.courseModel.findById(courseId).lean();
        if (!course)
            throw new common_1.NotFoundException('Không tìm thấy khóa học.');
        if (course.teacherId.toString() !== teacherId) {
            throw new common_1.ForbiddenException('Bạn không sở hữu khóa học này.');
        }
        if (course.status !== course_schema_1.CourseStatus.PUBLISHED) {
            throw new common_1.BadRequestException('Chỉ khóa học đã xuất bản mới được quảng cáo.');
        }
        const amount = this.coinsPerDay() * durationDays;
        const pending = await this.promoModel.create({
            courseId: new mongoose_2.Types.ObjectId(courseId),
            teacherId: new mongoose_2.Types.ObjectId(teacherId),
            expiresAt: new Date(0),
            amountPaid: amount,
            durationDays,
        });
        const promoId = pending._id;
        try {
            await this.walletsService.processPayment({
                userId: teacherId,
                amount,
                referenceId: promoId.toString(),
                referenceType: wallet_transaction_schema_1.ReferenceType.COURSE_PROMOTION,
                description: `Quảng cáo khóa học ${durationDays} ngày`,
            });
        }
        catch (e) {
            await this.promoModel.deleteOne({ _id: promoId });
            throw e;
        }
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + durationDays);
        await this.promoModel.updateOne({ _id: promoId }, { $set: { expiresAt } });
        return {
            message: 'Kích hoạt quảng cáo thành công',
            data: {
                promotionId: promoId.toString(),
                courseId,
                expiresAt,
                amountPaid: amount,
            },
        };
    }
};
exports.CoursePromotionService = CoursePromotionService;
exports.CoursePromotionService = CoursePromotionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(course_promotion_schema_1.CoursePromotion.name)),
    __param(1, (0, mongoose_1.InjectModel)(course_schema_1.Course.name)),
    __param(2, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        courses_repository_1.CoursesRepository,
        wallets_service_1.WalletsService,
        pricing_plans_repository_1.PricingPlansRepository,
        config_1.ConfigService])
], CoursePromotionService);
//# sourceMappingURL=course-promotion.service.js.map