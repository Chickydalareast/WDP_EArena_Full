import { Injectable, Logger, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { Types } from 'mongoose';
import { PricingPlansRepository } from './repositories/pricing-plans.repository';
import { SubscriptionTransactionsRepository } from './repositories/subscription-transactions.repository';
import { TransactionStatus, BillingCycle } from './schemas/subscription-transaction.schema';
import { PricingPlanCode } from './schemas/pricing-plan.schema';
import { UpgradePlanPayload } from './interfaces/subscription.interface';

import { UsersRepository } from '../users/users.repository';
import { WalletsService } from '../wallets/wallets.service';

@Injectable()
export class SubscriptionsService {
    private readonly logger = new Logger(SubscriptionsService.name);

    private readonly PLAN_WEIGHT = {
        [PricingPlanCode.FREE]: 0,
        [PricingPlanCode.PRO]: 1,
        [PricingPlanCode.ENTERPRISE]: 2,
    };

    constructor(
        private readonly pricingPlansRepo: PricingPlansRepository,
        private readonly transactionsRepo: SubscriptionTransactionsRepository,
        private readonly usersRepo: UsersRepository,
        private readonly walletsService: WalletsService,
    ) { }

    async upgradePlan(payload: UpgradePlanPayload) {
        return this.transactionsRepo.executeInTransaction(async () => {
            const now = new Date();
            const { teacherId, planId, billingCycle } = payload;

            const targetPlan = await this.pricingPlansRepo.findByIdSafe(planId);
            if (!targetPlan || !targetPlan.isActive) {
                throw new NotFoundException('Gói cước không tồn tại hoặc đã ngừng cung cấp.');
            }

            if (targetPlan.code === PricingPlanCode.FREE) {
                throw new BadRequestException('Không thể chủ động mua gói FREE.');
            }

            const teacher = await this.usersRepo.findUserWithSubscription(teacherId);
            if (!teacher) throw new NotFoundException('Không tìm thấy thông tin tài khoản.');

            const currentPlan = teacher.currentPlanId as any; 
            const currentExpiresAt = teacher.planExpiresAt ? new Date(teacher.planExpiresAt) : null;
            const isCurrentActive = currentPlan && currentExpiresAt && currentExpiresAt > now;

            const baseAmount = billingCycle === BillingCycle.YEARLY ? targetPlan.priceYearly : targetPlan.priceMonthly;
            let proratedDiscount = 0;
            let newExpiresAt = new Date(now.getTime());

            const cycleDays = billingCycle === BillingCycle.YEARLY ? 365 : 30;

            if (isCurrentActive) {
                const currentWeight = this.PLAN_WEIGHT[currentPlan.code as PricingPlanCode] || 0;
                const targetWeight = this.PLAN_WEIGHT[targetPlan.code as PricingPlanCode] || 0;

                if (targetWeight < currentWeight) {
                    throw new BadRequestException(`Bạn đang sử dụng gói cao hơn (${currentPlan.name}). Vui lòng chờ đến khi hết hạn để đổi gói.`);
                }

                else if (targetWeight === currentWeight) {
                    newExpiresAt = new Date(currentExpiresAt.getTime());
                }

                else {
                    const remainingMs = currentExpiresAt.getTime() - now.getTime();
                    const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));

                    const lastTx = await this.transactionsRepo.findOneSafe(
                        {
                            userId: new Types.ObjectId(teacherId.toString()),
                            planId: currentPlan._id,
                            status: TransactionStatus.PAID
                        },
                        { sort: { createdAt: -1 } }
                    );

                    let dailyRate = 0;
                    if (lastTx) {
                        const lastCycleDays = lastTx.billingCycle === BillingCycle.YEARLY ? 365 : 30;
                        dailyRate = lastTx.finalAmount / lastCycleDays;
                    } else {
                        const fullCurrentPlan = await this.pricingPlansRepo.findByIdSafe(currentPlan._id, { select: 'priceMonthly' });
                        if (!fullCurrentPlan) {
                            throw new InternalServerErrorException('Dữ liệu đối chiếu gói cước hiện tại bị lỗi.');
                        }
                        dailyRate = fullCurrentPlan.priceMonthly / 30;
                    }

                    proratedDiscount = Math.floor(remainingDays * dailyRate);
                    newExpiresAt = new Date(now.getTime());
                }
            }

            newExpiresAt.setDate(newExpiresAt.getDate() + cycleDays);

            const finalAmount = Math.max(0, baseAmount - proratedDiscount);

            if (finalAmount > 0) {
                await this.walletsService.processSubscriptionPayment({
                    teacherId: teacherId.toString(),
                    amount: finalAmount,
                    planId: targetPlan._id as Types.ObjectId,
                    description: `Thanh toán gói ${targetPlan.name} (${billingCycle})${proratedDiscount > 0 ? ` - Đã giảm ${proratedDiscount.toLocaleString('vi-VN')}đ bù trừ gói cũ` : ''}`,
                });
            }

            const transaction = await this.transactionsRepo.createDocument({
                userId: new Types.ObjectId(teacherId.toString()),
                planId: targetPlan._id as Types.ObjectId,
                billingCycle,
                baseAmount,
                proratedDiscount,
                finalAmount,
                status: TransactionStatus.PAID,
            });

            const updatedUser = await this.usersRepo.updateByIdSafe(teacherId, {
                $set: {
                    currentPlanId: targetPlan._id,
                    planExpiresAt: newExpiresAt,
                }
            });

            if (!updatedUser) {
                throw new InternalServerErrorException('Lỗi đồng bộ dữ liệu người dùng.');
            }

            return {
                message: proratedDiscount > 0
                    ? `Nâng cấp thành công! Đã khấu trừ ${proratedDiscount.toLocaleString('vi-VN')} VNĐ từ gói cũ.`
                    : `Thanh toán gói ${targetPlan.name} thành công.`,
                transactionId: (transaction._id as Types.ObjectId).toString(),
                expiresAt: newExpiresAt
            };
        });
    }

    async getAllPlans() {
        return this.pricingPlansRepo.modelInstance
            .find({ isActive: true })
            .select('-__v -createdAt -updatedAt')
            .sort({ priceMonthly: 1 })
            .lean()
            .exec();
    }
}