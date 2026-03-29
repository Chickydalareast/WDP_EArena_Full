import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { UpgradePlanDto } from './dto/subscription.dto';
import { UpgradePlanPayload } from './interfaces/subscription.interface';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@Controller('subscriptions')
export class SubscriptionsController {
    constructor(private readonly subscriptionsService: SubscriptionsService) { }

    @Public()
    @Get('plans')
    async getAllPlans() {
        const data = await this.subscriptionsService.getAllPlans();
        return {
            message: 'Lấy danh sách gói cước thành công.',
            data
        };
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Post('upgrade')
    @Roles(UserRole.TEACHER)
    async upgradePlan(
        @Body() dto: UpgradePlanDto,
        @CurrentUser('userId') userId: string
    ) {
        const payload: UpgradePlanPayload = {
            teacherId: userId,
            planId: dto.planId,
            billingCycle: dto.billingCycle,
        };

        return this.subscriptionsService.upgradePlan(payload);
    }
}