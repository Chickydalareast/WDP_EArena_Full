import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PricingPlanCode } from '../subscriptions/schemas/pricing-plan.schema';
import { PricingPlansRepository } from '../subscriptions/repositories/pricing-plans.repository';

@Injectable()
export class AdminSeederService implements OnModuleInit {
  private readonly logger = new Logger(AdminSeederService.name);

  constructor(private readonly pricingPlansRepo: PricingPlansRepository) {}

  async onModuleInit() {
    await this.seedPricingPlansIdempotent();
  }

  private async seedPricingPlansIdempotent() {
    const plans = [
      {
        name: 'Free',
        code: PricingPlanCode.FREE,
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
        code: PricingPlanCode.PRO,
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
        code: PricingPlanCode.ENTERPRISE,
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
    } catch (error) {
      this.logger.error(`Lỗi đồng bộ cấu hình Gói cước: ${error instanceof Error ? error.message : 'Unknown Error'}`);
    }
  }
}