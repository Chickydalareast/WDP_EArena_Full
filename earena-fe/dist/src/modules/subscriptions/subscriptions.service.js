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
var SubscriptionsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("mongoose");
const pricing_plans_repository_1 = require("./repositories/pricing-plans.repository");
const subscription_transactions_repository_1 = require("./repositories/subscription-transactions.repository");
const subscription_transaction_schema_1 = require("./schemas/subscription-transaction.schema");
const pricing_plan_schema_1 = require("./schemas/pricing-plan.schema");
const users_repository_1 = require("../users/users.repository");
const wallets_service_1 = require("../wallets/wallets.service");
let SubscriptionsService = SubscriptionsService_1 = class SubscriptionsService {
    pricingPlansRepo;
    transactionsRepo;
    usersRepo;
    walletsService;
    logger = new common_1.Logger(SubscriptionsService_1.name);
    PLAN_WEIGHT = {
        [pricing_plan_schema_1.PricingPlanCode.FREE]: 0,
        [pricing_plan_schema_1.PricingPlanCode.PRO]: 1,
        [pricing_plan_schema_1.PricingPlanCode.ENTERPRISE]: 2,
    };
    constructor(pricingPlansRepo, transactionsRepo, usersRepo, walletsService) {
        this.pricingPlansRepo = pricingPlansRepo;
        this.transactionsRepo = transactionsRepo;
        this.usersRepo = usersRepo;
        this.walletsService = walletsService;
    }
    async upgradePlan(payload) {
        return this.transactionsRepo.executeInTransaction(async () => {
            const now = new Date();
            const { teacherId, planId, billingCycle } = payload;
            const targetPlan = await this.pricingPlansRepo.findByIdSafe(planId);
            if (!targetPlan || !targetPlan.isActive) {
                throw new common_1.NotFoundException('Gói cước không tồn tại hoặc đã ngừng cung cấp.');
            }
            if (targetPlan.code === pricing_plan_schema_1.PricingPlanCode.FREE) {
                throw new common_1.BadRequestException('Không thể chủ động mua gói FREE.');
            }
            const teacher = await this.usersRepo.findUserWithSubscription(teacherId);
            if (!teacher)
                throw new common_1.NotFoundException('Không tìm thấy thông tin tài khoản.');
            const currentPlan = teacher.currentPlanId;
            const currentExpiresAt = teacher.planExpiresAt
                ? new Date(teacher.planExpiresAt)
                : null;
            const isCurrentActive = currentPlan && currentExpiresAt && currentExpiresAt > now;
            const baseAmount = billingCycle === subscription_transaction_schema_1.BillingCycle.YEARLY
                ? targetPlan.priceYearly
                : targetPlan.priceMonthly;
            let proratedDiscount = 0;
            let newExpiresAt = new Date(now.getTime());
            const cycleDays = billingCycle === subscription_transaction_schema_1.BillingCycle.YEARLY ? 365 : 30;
            if (isCurrentActive) {
                const currentWeight = this.PLAN_WEIGHT[currentPlan.code] || 0;
                const targetWeight = this.PLAN_WEIGHT[targetPlan.code] || 0;
                if (targetWeight < currentWeight) {
                    throw new common_1.BadRequestException(`Bạn đang sử dụng gói cao hơn (${currentPlan.name}). Vui lòng chờ đến khi hết hạn để đổi gói.`);
                }
                else if (targetWeight === currentWeight) {
                    newExpiresAt = new Date(currentExpiresAt.getTime());
                }
                else {
                    const remainingMs = currentExpiresAt.getTime() - now.getTime();
                    const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
                    const lastTx = await this.transactionsRepo.findOneSafe({
                        userId: new mongoose_1.Types.ObjectId(teacherId.toString()),
                        planId: currentPlan._id,
                        status: subscription_transaction_schema_1.TransactionStatus.PAID,
                    }, { sort: { createdAt: -1 } });
                    let dailyRate = 0;
                    if (lastTx) {
                        const lastCycleDays = lastTx.billingCycle === subscription_transaction_schema_1.BillingCycle.YEARLY ? 365 : 30;
                        dailyRate = lastTx.finalAmount / lastCycleDays;
                    }
                    else {
                        const fullCurrentPlan = await this.pricingPlansRepo.findByIdSafe(currentPlan._id, { select: 'priceMonthly' });
                        if (!fullCurrentPlan) {
                            throw new common_1.InternalServerErrorException('Dữ liệu đối chiếu gói cước hiện tại bị lỗi.');
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
                    planId: targetPlan._id,
                    description: `Thanh toán gói ${targetPlan.name} (${billingCycle})${proratedDiscount > 0 ? ` - Đã giảm ${proratedDiscount.toLocaleString('vi-VN')}đ bù trừ gói cũ` : ''}`,
                });
            }
            const transaction = await this.transactionsRepo.createDocument({
                userId: new mongoose_1.Types.ObjectId(teacherId.toString()),
                planId: targetPlan._id,
                billingCycle,
                baseAmount,
                proratedDiscount,
                finalAmount,
                status: subscription_transaction_schema_1.TransactionStatus.PAID,
            });
            const updatedUser = await this.usersRepo.updateByIdSafe(teacherId, {
                $set: {
                    currentPlanId: targetPlan._id,
                    planExpiresAt: newExpiresAt,
                },
            });
            if (!updatedUser) {
                throw new common_1.InternalServerErrorException('Lỗi đồng bộ dữ liệu người dùng.');
            }
            return {
                message: proratedDiscount > 0
                    ? `Nâng cấp thành công! Đã khấu trừ ${proratedDiscount.toLocaleString('vi-VN')} VNĐ từ gói cũ.`
                    : `Thanh toán gói ${targetPlan.name} thành công.`,
                transactionId: transaction._id.toString(),
                expiresAt: newExpiresAt,
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
};
exports.SubscriptionsService = SubscriptionsService;
exports.SubscriptionsService = SubscriptionsService = SubscriptionsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [pricing_plans_repository_1.PricingPlansRepository,
        subscription_transactions_repository_1.SubscriptionTransactionsRepository,
        users_repository_1.UsersRepository,
        wallets_service_1.WalletsService])
], SubscriptionsService);
//# sourceMappingURL=subscriptions.service.js.map