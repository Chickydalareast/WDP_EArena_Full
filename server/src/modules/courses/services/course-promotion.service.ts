import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  CoursePromotion,
  CoursePromotionDocument,
} from '../schemas/course-promotion.schema';
import { Course, CourseDocument, CourseStatus } from '../schemas/course.schema';
import { CoursesRepository } from '../courses.repository';
import { WalletsService } from '../../wallets/wallets.service';
import { ReferenceType } from '../../wallets/schemas/wallet-transaction.schema';
import { PricingPlansRepository } from '../../subscriptions/repositories/pricing-plans.repository';
import { PricingPlanCode } from '../../subscriptions/schemas/pricing-plan.schema';
import { User, UserDocument } from '../../users/schemas/user.schema';
import { UserRole } from '../../../common/enums/user-role.enum';

const CAROUSEL_MAX = 12;
const ALLOWED_DAYS = new Set([7, 14, 30]);

@Injectable()
export class CoursePromotionService {
  constructor(
    @InjectModel(CoursePromotion.name)
    private readonly promoModel: Model<CoursePromotionDocument>,
    @InjectModel(Course.name) private readonly courseModel: Model<CourseDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly coursesRepo: CoursesRepository,
    private readonly walletsService: WalletsService,
    private readonly pricingPlansRepo: PricingPlansRepository,
    private readonly config: ConfigService,
  ) {}

  private coinsPerDay(): number {
    const raw = this.config.get<string>('COURSE_PROMOTION_COINS_PER_DAY');
    const n = raw ? Number(raw) : NaN;
    return Number.isFinite(n) && n > 0 ? n : 50_000;
  }

  async getFeaturedCarouselCourses(): Promise<{
    items: Record<string, unknown>[];
    promoPricePerDay: number;
  }> {
    const now = new Date();
    const orderedIds: Types.ObjectId[] = [];
    const seen = new Set<string>();

    const promos = await this.promoModel
      .find({ expiresAt: { $gt: now } })
      .sort({ expiresAt: -1 })
      .limit(CAROUSEL_MAX)
      .lean()
      .exec();

    for (const p of promos) {
      const id = (p as any).courseId?.toString?.();
      if (!id || seen.has(id)) continue;
      seen.add(id);
      orderedIds.push(new Types.ObjectId(id));
      if (orderedIds.length >= CAROUSEL_MAX) break;
    }

    const enterprisePlan = await this.pricingPlansRepo.findOne({
      code: PricingPlanCode.ENTERPRISE,
      isActive: true,
    });
    if (enterprisePlan && orderedIds.length < CAROUSEL_MAX) {
      const entTeachers = await this.userModel
        .find({
          role: UserRole.TEACHER,
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
            status: CourseStatus.PUBLISHED,
            teacherId: { $in: tids },
          })
          .sort({ createdAt: -1 })
          .limit(CAROUSEL_MAX * 2)
          .select('_id')
          .lean()
          .exec();

        for (const c of entCourses) {
          const sid = c._id.toString();
          if (seen.has(sid)) continue;
          seen.add(sid);
          orderedIds.push(c._id as Types.ObjectId);
          if (orderedIds.length >= CAROUSEL_MAX) break;
        }
      }
    }

    const items = await this.coursesRepo.findPublishedPublicCardsByOrderedIds(
      orderedIds,
    );

    return {
      items,
      promoPricePerDay: this.coinsPerDay(),
    };
  }

  async purchasePromotion(
    teacherId: string,
    courseId: string,
    durationDays: number,
  ) {
    if (!ALLOWED_DAYS.has(durationDays)) {
      throw new BadRequestException('Chọn thời hạn 7, 14 hoặc 30 ngày.');
    }

    const course = await this.courseModel.findById(courseId).lean();
    if (!course) throw new NotFoundException('Không tìm thấy khóa học.');
    if (course.teacherId.toString() !== teacherId) {
      throw new ForbiddenException('Bạn không sở hữu khóa học này.');
    }
    if (course.status !== CourseStatus.PUBLISHED) {
      throw new BadRequestException('Chỉ khóa học đã xuất bản mới được quảng cáo.');
    }

    const amount = this.coinsPerDay() * durationDays;

    const pending = await this.promoModel.create({
      courseId: new Types.ObjectId(courseId),
      teacherId: new Types.ObjectId(teacherId),
      expiresAt: new Date(0),
      amountPaid: amount,
      durationDays,
    });

    const promoId = pending._id as Types.ObjectId;

    try {
      await this.walletsService.processPayment({
        userId: teacherId,
        amount,
        referenceId: promoId.toString(),
        referenceType: ReferenceType.COURSE_PROMOTION,
        description: `Quảng cáo khóa học ${durationDays} ngày`,
      });
    } catch (e) {
      await this.promoModel.deleteOne({ _id: promoId });
      throw e;
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + durationDays);

    await this.promoModel.updateOne(
      { _id: promoId },
      { $set: { expiresAt } },
    );

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
}
