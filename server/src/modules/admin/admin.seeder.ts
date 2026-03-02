import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PricingPlan, PricingPlanCode, PricingPlanDocument } from './schemas/pricing-plan.schema';

@Injectable()
export class AdminSeederService implements OnModuleInit {
  private readonly logger = new Logger(AdminSeederService.name);

  constructor(@InjectModel(PricingPlan.name) private readonly planModel: Model<PricingPlanDocument>) {}

  async onModuleInit() {
    const count = await this.planModel.countDocuments({});
    if (count > 0) return;

    await this.planModel.insertMany([
      {
        name: 'Free',
        code: PricingPlanCode.FREE,
        priceMonthly: 0,
        priceYearly: 0,
        benefits: ['Làm đề cơ bản', 'Lưu kết quả gần đây'],
        isActive: true,
      },
      {
        name: 'Pro',
        code: PricingPlanCode.PRO,
        priceMonthly: 99000,
        priceYearly: 999000,
        benefits: ['Làm đề không giới hạn', 'Phân tích điểm yếu theo chủ đề', 'Gợi ý lộ trình ôn tập'],
        isActive: true,
      },
      {
        name: 'Enterprise',
        code: PricingPlanCode.ENTERPRISE,
        priceMonthly: 399000,
        priceYearly: 3999000,
        benefits: ['Dashboard vận hành', 'Quản lý lớp & giáo viên nâng cao', 'Hỗ trợ SLA'],
        isActive: true,
      },
    ] as any);

    this.logger.log('Seeded default pricing plans (FREE/PRO/ENTERPRISE).');
  }
}
