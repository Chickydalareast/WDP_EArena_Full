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
var AdminSeederService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminSeederService = void 0;
const common_1 = require("@nestjs/common");
const pricing_plan_schema_1 = require("../subscriptions/schemas/pricing-plan.schema");
const pricing_plans_repository_1 = require("../subscriptions/repositories/pricing-plans.repository");
let AdminSeederService = AdminSeederService_1 = class AdminSeederService {
    pricingPlansRepo;
    logger = new common_1.Logger(AdminSeederService_1.name);
    constructor(pricingPlansRepo) {
        this.pricingPlansRepo = pricingPlansRepo;
    }
    async onModuleInit() {
        await this.seedPricingPlansIdempotent();
    }
    async seedPricingPlansIdempotent() {
        const plans = [
            {
                name: 'Free',
                code: pricing_plan_schema_1.PricingPlanCode.FREE,
                priceMonthly: 0,
                priceYearly: 0,
                benefits: ['Làm đề cơ bản', 'Lưu kết quả gần đây'],
                isActive: true,
                canCreatePaidCourse: false,
                isUnlimitedCourses: false,
                maxCourses: 1,
            },
            {
                name: 'Pro',
                code: pricing_plan_schema_1.PricingPlanCode.PRO,
                priceMonthly: 99000,
                priceYearly: 999000,
                benefits: ['Làm đề không giới hạn', 'Phân tích điểm yếu theo chủ đề', 'Gợi ý lộ trình ôn tập'],
                isActive: true,
                canCreatePaidCourse: true,
                isUnlimitedCourses: true,
                maxCourses: 0,
            },
            {
                name: 'Enterprise',
                code: pricing_plan_schema_1.PricingPlanCode.ENTERPRISE,
                priceMonthly: 399000,
                priceYearly: 3999000,
                benefits: ['Dashboard vận hành', 'Quản lý lớp & giáo viên nâng cao', 'Hỗ trợ SLA'],
                isActive: true,
                canCreatePaidCourse: true,
                isUnlimitedCourses: true,
                maxCourses: 0,
            },
        ];
        const bulkOps = plans.map((plan) => ({
            updateOne: {
                filter: { code: plan.code },
                update: { $set: plan },
                upsert: true,
            },
        }));
        try {
            await this.pricingPlansRepo.modelInstance.bulkWrite(bulkOps);
            this.logger.log('Thành công: Đã đồng bộ cấu hình Gói cước (Pricing Plans) chuẩn Enterprise.');
        }
        catch (error) {
            this.logger.error(`Lỗi đồng bộ cấu hình Gói cước: ${error instanceof Error ? error.message : 'Unknown Error'}`);
        }
    }
};
exports.AdminSeederService = AdminSeederService;
exports.AdminSeederService = AdminSeederService = AdminSeederService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [pricing_plans_repository_1.PricingPlansRepository])
], AdminSeederService);
//# sourceMappingURL=admin.seeder.js.map