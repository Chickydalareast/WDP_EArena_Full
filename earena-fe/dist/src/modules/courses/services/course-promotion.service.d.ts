import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { CoursePromotionDocument } from '../schemas/course-promotion.schema';
import { CourseDocument } from '../schemas/course.schema';
import { CoursesRepository } from '../courses.repository';
import { WalletsService } from '../../wallets/wallets.service';
import { PricingPlansRepository } from '../../subscriptions/repositories/pricing-plans.repository';
import { UserDocument } from '../../users/schemas/user.schema';
export declare class CoursePromotionService {
    private readonly promoModel;
    private readonly courseModel;
    private readonly userModel;
    private readonly coursesRepo;
    private readonly walletsService;
    private readonly pricingPlansRepo;
    private readonly config;
    constructor(promoModel: Model<CoursePromotionDocument>, courseModel: Model<CourseDocument>, userModel: Model<UserDocument>, coursesRepo: CoursesRepository, walletsService: WalletsService, pricingPlansRepo: PricingPlansRepository, config: ConfigService);
    private coinsPerDay;
    getFeaturedCarouselCourses(): Promise<{
        items: Record<string, unknown>[];
        promoPricePerDay: number;
    }>;
    purchasePromotion(teacherId: string, courseId: string, durationDays: number): Promise<{
        message: string;
        data: {
            promotionId: string;
            courseId: string;
            expiresAt: Date;
            amountPaid: number;
        };
    }>;
}
